from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from backend.app.db.database import get_db
from backend.app.db.repositories import (
    UserRepository, DatasetRepository, MLModelRepository,
    AlertRepository, SystemLogRepository
)
from backend.app.api.schemas.auth import UserResponse
from backend.app.api.schemas.admin import (
    UserUpdateRole, SystemLogResponse, SystemStatsResponse, DashboardStatsResponse
)
from backend.app.api.dependencies.auth import get_current_user, get_admin_user
from backend.app.db.models import User, Dataset, MLModel, Prediction, Alert, SystemLog

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    users = UserRepository.get_all(db)
    return users

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_data: UserUpdateRole,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    if role_data.role not in ["admin", "user", "viewer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin', 'user', or 'viewer'"
        )
    
    user = UserRepository.update_role(db, user_id, role_data.role)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": f"User role updated to {role_data.role}", "user_id": user_id}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    success = UserRepository.delete(db, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted", "user_id": user_id}

@router.get("/stats", response_model=SystemStatsResponse)
async def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_users = db.query(User).count()
    total_datasets = db.query(Dataset).count()
    total_models = db.query(MLModel).count()
    total_predictions = db.query(Prediction).count()
    total_alerts = db.query(Alert).count()
    active_alerts = db.query(Alert).filter(Alert.is_acknowledged == False).count()
    
    return SystemStatsResponse(
        total_users=total_users,
        total_datasets=total_datasets,
        total_models=total_models,
        total_predictions=total_predictions,
        total_alerts=total_alerts,
        active_alerts=active_alerts
    )

@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    predictions_today = db.query(Prediction).filter(
        Prediction.created_at >= today
    ).count()
    
    alerts_today = db.query(Alert).filter(
        Alert.created_at >= today
    ).count()
    
    active_model = MLModelRepository.get_active(db)
    active_model_info = None
    if active_model:
        active_model_info = {
            "id": active_model.id,
            "name": active_model.name,
            "version": active_model.version,
            "type": active_model.model_type,
            "accuracy": active_model.metrics.get("accuracy") if active_model.metrics else None
        }
    
    recent_predictions = db.query(Prediction).order_by(
        Prediction.created_at.desc()
    ).limit(10).all()
    
    recent_pred_list = [
        {
            "id": p.id,
            "leak_class": p.leak_class,
            "leak_probability": p.leak_probability,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in recent_predictions
    ]
    
    leak_distribution = {}
    for leak_class in ["none", "micro", "slow", "medium", "catastrophic"]:
        count = db.query(Prediction).filter(
            Prediction.leak_class == leak_class
        ).count()
        leak_distribution[leak_class] = count
    
    return DashboardStatsResponse(
        predictions_today=predictions_today,
        alerts_today=alerts_today,
        active_model=active_model_info,
        recent_predictions=recent_pred_list,
        leak_distribution=leak_distribution
    )

@router.get("/logs", response_model=List[SystemLogResponse])
async def get_system_logs(
    limit: int = 100,
    level: str = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    query = db.query(SystemLog).order_by(SystemLog.created_at.desc())
    
    if level:
        query = query.filter(SystemLog.level == level.upper())
    
    logs = query.limit(limit).all()
    return logs

@router.post("/logs")
async def create_log(
    level: str,
    message: str,
    module: str = "admin",
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    log = SystemLogRepository.create(
        db,
        level=level.upper(),
        message=message,
        module=module,
        user_id=admin_user.id
    )
    
    return {"message": "Log created", "log_id": log.id}
