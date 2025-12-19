from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserUpdateRole(BaseModel):
    role: str

class SystemLogResponse(BaseModel):
    id: int
    level: str
    message: str
    module: str
    user_id: Optional[int]
    extra_data: Optional[Dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class SystemStatsResponse(BaseModel):
    total_users: int
    total_datasets: int
    total_models: int
    total_predictions: int
    total_alerts: int
    active_alerts: int

class DashboardStatsResponse(BaseModel):
    predictions_today: int
    alerts_today: int
    active_model: Optional[Dict]
    recent_predictions: List[Dict]
    leak_distribution: Dict[str, int]
