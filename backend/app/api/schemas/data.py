from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

class DataGenerateRequest(BaseModel):
    rows: int = 1000
    noise_level: float = 0.1
    anomaly_ratio: float = 0.05
    include_time_series: bool = True
    leak_distribution: Optional[Dict[str, float]] = None

class DataGenerateResponse(BaseModel):
    dataset_id: int
    name: str
    rows: int
    columns: int
    schema: Dict[str, str]
    summary: Dict[str, Any]

class DatasetResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    row_count: Optional[int]
    column_count: Optional[int]
    schema_info: Optional[Dict]
    summary_stats: Optional[Dict]
    is_synthetic: bool
    created_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class DataSchemaResponse(BaseModel):
    columns: List[Dict[str, Any]]
    target_variable: str
    feature_types: Dict[str, str]

class DataSummaryResponse(BaseModel):
    row_count: int
    column_count: int
    missing_values: Dict[str, int]
    statistics: Dict[str, Dict[str, float]]
    class_distribution: Dict[str, int]

class DataUploadResponse(BaseModel):
    dataset_id: int
    name: str
    rows: int
    columns: int
    message: str
