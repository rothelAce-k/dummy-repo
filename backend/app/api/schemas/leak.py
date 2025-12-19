from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

class LeakStreamRequest(BaseModel):
    pressure_psi: float
    flow_rate_lpm: float
    temperature_c: float
    vibration_gforce: float
    acoustic_db: float
    timestamp: Optional[datetime] = None
    sensor_id: Optional[str] = None

class LeakStreamResponse(BaseModel):
    leak_probability: float
    leak_class: str
    anomaly_score: float
    recommended_action: str
    alert_generated: bool
    timestamp: datetime

class AlertResponse(BaseModel):
    id: int
    severity: str
    leak_class: str
    message: str
    sensor_data: Dict
    is_acknowledged: bool
    acknowledged_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TimelineEntry(BaseModel):
    timestamp: datetime
    leak_probability: float
    leak_class: str
    anomaly_score: float

class TimelineResponse(BaseModel):
    entries: List[TimelineEntry]
    total_predictions: int
    alert_count: int
