from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import os
import json
from datetime import datetime

from backend.app.db.database import get_db
from backend.app.db.repositories import DatasetRepository
from backend.app.api.schemas.data import (
    DataGenerateRequest, DataGenerateResponse, DatasetResponse,
    DataSchemaResponse, DataSummaryResponse, DataUploadResponse
)
from backend.app.api.dependencies.auth import get_current_user, get_optional_user
from backend.app.db.models import User
from backend.app.ml.generator import SyntheticDataGenerator
from backend.app.core.config import settings
from typing import Optional

router = APIRouter(prefix="/data", tags=["Data Management"])

# Helper to get user ID safely
def get_user_id(user: Optional[User]) -> int:
    return user.id if user else 1

@router.post("/generate", response_model=DataGenerateResponse)
async def generate_data(
    request: DataGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    owner_id = get_user_id(current_user)
    
    # Use new Generator
    # Note: request.noise_level, anomaly_ratio etc might be ignored if generator doesn't expose them broadly
    # But our generator is robust. Let's just create a full dataset or a segment.
    # The new generator `generate_full_dataset` aims for balanced scenarios.
    
    generator = SyntheticDataGenerator()
    df = generator.generate_full_dataset(n_samples=request.rows)
    
    # Generate summary stats
    schema = {col: str(df[col].dtype) for col in df.columns}
    summary = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "class_distribution": df['leak_status'].value_counts().to_dict() if 'leak_status' in df.columns else {}
    }

    os.makedirs(settings.UPLOAD_PATH, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"synthetic_data_{timestamp}.csv"
    filepath = os.path.join(settings.UPLOAD_PATH, filename)
    df.to_csv(filepath, index=False)
    
    dataset = DatasetRepository.create(
        db,
        name=f"Synthetic Dataset {timestamp}",
        owner_id=owner_id,
        file_path=filepath,
        row_count=len(df),
        column_count=len(df.columns),
        schema_info=schema,
        summary_stats=summary,
        is_synthetic=True,
        description=f"Synthetic leak detection dataset with {request.rows} rows (New Generator)"
    )
    
    return DataGenerateResponse(
        dataset_id=dataset.id,
        name=dataset.name,
        rows=len(df),
        columns=len(df.columns),
        schema=schema,
        summary=summary
    )

@router.get("/schema", response_model=DataSchemaResponse)
async def get_schema():
    # Define STRICT Raw Schema
    columns = [
        {"name": "pressure_psi", "type": "float", "description": "System pressure in PSI"},
        {"name": "flow_rate_lpm", "type": "float", "description": "Flow rate in Liters/min"},
        {"name": "temperature_c", "type": "float", "description": "Temperature in Celsius"},
        {"name": "vibration_gforce", "type": "float", "description": "Vibration intensity (g)"},
        {"name": "acoustic_db", "type": "float", "description": "Acoustic noise level (dB)"}
    ]
    
    feature_types = {
        "numeric": ["pressure_psi", "flow_rate_lpm", "temperature_c", "vibration_gforce", "acoustic_db"],
        "categorical": [],
        "timestamp": ["timestamp"],
        "derived": [] # No derived features needed from USER
    }
    
    return DataSchemaResponse(
        columns=columns,
        target_variable="leak_status",
        feature_types=feature_types
    )

@router.get("/summary/{dataset_id}", response_model=DataSummaryResponse)
async def get_summary(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    dataset = DatasetRepository.get_by_id(db, dataset_id)
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    summary = dataset.summary_stats or {}
    
    return DataSummaryResponse(
        row_count=dataset.row_count or 0,
        column_count=dataset.column_count or 0,
        missing_values=summary.get("missing_values", {}),
        statistics=summary.get("statistics", {}),
        class_distribution=summary.get("class_distribution", {})
    )

@router.post("/upload", response_model=DataUploadResponse)
async def upload_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported"
        )
    
    
    # TEMPORARILY DISABLED
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Dataset uploads are temporarily disabled for maintenance. Please use the pre-loaded datasets."
    )

    # os.makedirs(settings.UPLOAD_PATH, exist_ok=True)
    # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # filename = f"uploaded_{timestamp}_{file.filename}"
    # filepath = os.path.join(settings.UPLOAD_PATH, filename)
    
    # content = await file.read()
    # with open(filepath, 'wb') as f:
    #     f.write(content)
    
    df = pd.read_csv(filepath)
    
    # Strict validation optional, but let's just accept it and profile it
    schema = {col: str(df[col].dtype) for col in df.columns}
    
    summary = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
        "statistics": {}
    }
    
    for col in df.select_dtypes(include=['number']).columns:
        summary["statistics"][col] = {
            "mean": float(df[col].mean()),
            "std": float(df[col].std()),
            "min": float(df[col].min()),
            "max": float(df[col].max())
        }
    
    if "leak_status" in df.columns:
        summary["class_distribution"] = df["leak_status"].value_counts().to_dict()
    
    dataset = DatasetRepository.create(
        db,
        name=file.filename,
        owner_id=get_user_id(current_user),
        file_path=filepath,
        row_count=len(df),
        column_count=len(df.columns),
        schema_info=schema,
        summary_stats=summary,
        is_synthetic=False,
        description=f"Uploaded dataset: {file.filename}"
    )
    
    return DataUploadResponse(
        dataset_id=dataset.id,
        name=dataset.name,
        rows=len(df),
        columns=len(df.columns),
        message="Dataset uploaded successfully"
    )

@router.get("/datasets", response_model=List[DatasetResponse])
async def list_datasets(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    datasets = DatasetRepository.get_all(db)
    return datasets

@router.get("/datasets/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    dataset = DatasetRepository.get_by_id(db, dataset_id)
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return dataset

@router.get("/datasets/{dataset_id}/preview")
async def preview_dataset(
    dataset_id: int,
    rows: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    dataset = DatasetRepository.get_by_id(db, dataset_id)
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    if not dataset.file_path or not os.path.exists(dataset.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found"
        )
    
    df = pd.read_csv(dataset.file_path, nrows=rows)
    
    for col in df.select_dtypes(include=['datetime64']).columns:
        df[col] = df[col].astype(str)
    
    return {
        "columns": df.columns.tolist(),
        "data": df.to_dict(orient="records"),
        "total_rows": dataset.row_count
    }

@router.get("/datasets/{dataset_id}/download")
async def download_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    dataset = DatasetRepository.get_by_id(db, dataset_id)
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    if not dataset.file_path or not os.path.exists(dataset.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found"
        )
        
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=dataset.file_path,
        filename=os.path.basename(dataset.file_path),
        media_type='text/csv'
    )

@router.delete("/datasets/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    dataset = DatasetRepository.get_by_id(db, dataset_id)
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Delete file if exists
    if dataset.file_path and os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except OSError:
            pass # Log error but continue to delete DB record
            
    DatasetRepository.delete(db, dataset_id)
    return None
