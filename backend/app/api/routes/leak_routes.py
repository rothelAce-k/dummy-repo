from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from backend.app.db.database import get_db
from backend.app.db.repositories import PredictionRepository, AlertRepository, MLModelRepository
from backend.app.api.schemas.leak import (
    LeakStreamRequest, LeakStreamResponse, AlertResponse, TimelineResponse, TimelineEntry
)
from backend.app.api.dependencies.auth import get_current_user, get_optional_user
from backend.app.db.models import User, Prediction, Alert
from backend.app.ml.loader import ModelLoader
from typing import Optional

router = APIRouter(prefix="/leak", tags=["Leak Detection"])

# Simulated Sensor Registry for Digital Twin
# Simulated Sensor Registry for Digital Twin - Matched to SensorMonitor.jsx
TWIN_SENSORS = [
    {"id": "SENSOR_001", "type": "pump", "name": "Main Pump A", "x": 150, "y": 150},
    {"id": "SENSOR_002", "type": "valve", "name": "Valve Station B", "x": 450, "y": 150},
    {"id": "SENSOR_003", "type": "sensor", "name": "Pressure Node C", "x": 600, "y": 300},
    {"id": "SENSOR_004", "type": "sensor", "name": "Flow Meter D", "x": 450, "y": 450},
    {"id": "SENSOR_005", "type": "valve", "name": "Safety Valve E", "x": 150, "y": 450},
]

@router.get("/sensors")
async def get_digital_twin_sensors(current_user: Optional[User] = Depends(get_optional_user)):
    """
    Returns live telemetry for the Digital Twin schematic.
    Simulates real-time fluctuations for demonstration.
    """
    import math
    import time
    
    # Time-based simulation for "Live" feel
    t = time.time()
    
    # Base state - usually healthy
    system_health = "normal"
    
    # If there is a recent 'critical' prediction in DB, reflect that?
    # For now, let's make it dynamic based on seconds to show 'life'
    
    telemetry = []
    
    for s in TWIN_SENSORS:
        # Generate semi-realistic values
        base_pressure = 85.0
        base_flow = 120.0
        
        # Add sine wave fluctuation
        noise = math.sin(t + hash(s['id'])) * 2.0
        
        status = "normal"
        # Simulate a "glitch" every 20 seconds for visual interest
        if int(t) % 20 == 0 and s['type'] == 'valve':
             status = "warning"
        
        telemetry.append({
            "id": s['id'],
            "name": s['name'],
            "type": s['type'],
            "status": status,
            "pressure_psi": round(base_pressure + noise, 1),
            "flow_lpm": round(base_flow + (noise/2), 1),
            "temperature_c": round(45 + (noise/5), 1),
            "vibration_mm_s": round(0.5 + abs(noise/10), 2)
        })
        
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "system_status": system_health,
        "sensors": telemetry
    }


# Helper to get user ID safely
def get_user_id(user: Optional[User]) -> int:
    return user.id if user else 1

@router.post("/stream", response_model=LeakStreamResponse)
async def stream_prediction(
    request: LeakStreamRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # Prepare input data
    input_data = {
        "pressure_psi": request.pressure_psi,
        "flow_rate_lpm": request.flow_rate_lpm,
        "temperature_c": request.temperature_c,
        "vibration_gforce": request.vibration_gforce,
        "acoustic_db": request.acoustic_db,
        # Pipeline expects 'timestamp'? FeatureEngineer might not need it, but good to pass if relevant
        # FeatureEngineer in pipeline.py doesn't use timestamp for features yet, but generator uses it.
    }
    
    # Run Inference
    try:
        results = ModelLoader.predict([input_data])
        if not results:
             raise HTTPException(status_code=500, detail="Inference failed silently")
        result = results[0]
    except Exception as e:
        print(f"Inference Error: {e}")
        # Fallback/Error state
        result = {
            "leak_class": "error",
            "leak_probability": 0.0,
            "severity": "unknown",
            "anomaly_score": 0.0
        }
        if "Model not loaded" in str(e):
             raise HTTPException(status_code=503, detail="Model is not loaded. Please train the system.")

    # Determine Action Message
    recommended_action = "System Optimal"
    if result['leak_class'] == 'catastrophic':
        recommended_action = "EMERGENCY SHUTDOWN REQUIRED"
    elif result['leak_class'] == 'slow':
        recommended_action = "Schedule Maintenance Review"
    elif result['leak_class'] == 'micro':
        recommended_action = "Monitor Trend Closely"
    elif result['leak_class'] == 'error':
        recommended_action = "System Error - Check Logs"

    # Save Prediction
    # Note: MLModelRepository might be legacy. We can skip it or just get '1'.
    
    prediction = PredictionRepository.create(
        db,
        user_id=get_user_id(current_user),
        model_id=1, # Default placeholder since we have 1 unified model
        input_data=input_data,
        leak_probability=result["leak_probability"],
        leak_class=result["leak_class"],
        anomaly_score=result["anomaly_score"],
        recommended_action=recommended_action
    )
    
    # Alerting Logic
    alert_generated = False
    # Threshold check? No, class-based alerting is safer now.
    if result["leak_class"] in ["slow", "catastrophic", "micro"]: 
        # Maybe config decides if 'micro' alerts? User said "Normal noise must never cross below 95".
        # Let's alert on everything that isn't 'none'.
        
        # Avoid spamming alerts? The repository usually handles deduplication but let's just create it.
        alert_message = f"Leak Detected: {result['leak_class'].upper()} (Conf: {result['leak_probability']:.1%})"
        
        AlertRepository.create(
            db,
            severity=result["severity"],
            leak_class=result["leak_class"],
            message=alert_message,
            sensor_data=input_data
        )
        alert_generated = True
    
    timestamp = request.timestamp or datetime.utcnow()
    
    return LeakStreamResponse(
        leak_probability=result["leak_probability"],
        leak_class=result["leak_class"],
        anomaly_score=result["anomaly_score"],
        recommended_action=recommended_action,
        alert_generated=alert_generated,
        timestamp=timestamp
    )

@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    limit: int = 50,
    unacknowledged_only: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    query = db.query(Alert).order_by(Alert.created_at.desc())
    
    if unacknowledged_only:
        query = query.filter(Alert.is_acknowledged == False)
    
    alerts = query.limit(limit).all()
    return alerts

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    alert = AlertRepository.acknowledge(db, alert_id, get_user_id(current_user))
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return {"message": "Alert acknowledged", "alert_id": alert_id}

@router.post("/alerts/acknowledge-all")
async def acknowledge_all_alerts(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    count = AlertRepository.acknowledge_all(db, get_user_id(current_user))
    return {"message": "All alerts acknowledged", "count": count}

@router.get("/timeline", response_model=TimelineResponse)
async def get_timeline(
    hours: int = 24,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    since = datetime.utcnow() - timedelta(hours=hours)
    
    predictions = db.query(Prediction).filter(
        Prediction.created_at >= since
    ).order_by(Prediction.created_at.desc()).limit(500).all()
    
    entries = [
        TimelineEntry(
            timestamp=p.created_at,
            leak_probability=p.leak_probability or 0,
            leak_class=p.leak_class or "none",
            anomaly_score=p.anomaly_score or 0
        )
        for p in predictions
    ]
    
    alert_count = db.query(Alert).filter(
        Alert.created_at >= since
    ).count()
    
    return TimelineResponse(
        entries=entries,
        total_predictions=len(predictions),
        alert_count=alert_count
    )

@router.get("/stats")
async def get_leak_stats(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    predictions_today = db.query(Prediction).filter(
        Prediction.created_at >= today
    ).count()
    
    alerts_today = db.query(Alert).filter(
        Alert.created_at >= today
    ).count()
    
    leak_distribution = {}
    for leak_class in ["none", "micro", "slow", "catastrophic"]:
        count = db.query(Prediction).filter(
            Prediction.leak_class == leak_class,
            Prediction.created_at >= today
        ).count()
        leak_distribution[leak_class] = count
    
    unacknowledged_alerts = db.query(Alert).filter(
        Alert.is_acknowledged == False
    ).count()
    
    return {
        "predictions_today": predictions_today,
        "alerts_today": alerts_today,
        "unacknowledged_alerts": unacknowledged_alerts,
        "leak_distribution": leak_distribution
    }

@router.get("/model")
async def get_model_info(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get information about the currently loaded model.
    """
    return ModelLoader.get_info()

@router.post("/batch-predict")
async def batch_predict(
    data: List[LeakStreamRequest],
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # Convert request models to dicts
    input_data_list = []
    for item in data:
        input_data_list.append({
            "pressure_psi": item.pressure_psi,
            "flow_rate_lpm": item.flow_rate_lpm,
            "temperature_c": item.temperature_c,
            "vibration_gforce": item.vibration_gforce,
            "acoustic_db": item.acoustic_db
        })
        
    try:
        results = ModelLoader.predict(input_data_list)
        
        # Combine input and output
        final_response = []
        for inp, res in zip(input_data_list, results):
             final_response.append({
                 "input": inp,
                 "prediction": res
             })
             
        return {"predictions": final_response, "count": len(final_response)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
