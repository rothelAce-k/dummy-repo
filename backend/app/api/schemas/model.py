from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

class ModelTrainRequest(BaseModel):
    dataset_id: int
    model_types: Optional[List[str]] = None
    test_size: float = 0.2
    hyperparameters: Optional[Dict[str, Any]] = None

class ModelTrainResponse(BaseModel):
    job_id: int
    status: str
    message: str

class ModelMetricsResponse(BaseModel):
    model_id: int
    model_name: str
    model_type: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float]
    confusion_matrix: List[List[int]]
    feature_importance: Dict[str, float]
    classification_report: Dict[str, Any]

class ModelPredictRequest(BaseModel):
    pressure_psi: float
    flow_rate_lpm: float
    temperature_c: float
    vibration_gforce: float
    acoustic_db: float

class ModelPredictResponse(BaseModel):
    leak_probability: float
    leak_class: str
    anomaly_score: float
    recommended_action: str
    confidence: float

class ModelVersionResponse(BaseModel):
    id: int
    name: str
    version: str
    model_type: str
    is_active: bool
    metrics: Optional[Dict]
    created_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class TrainingJobResponse(BaseModel):
    id: int
    status: str
    progress: float
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True
