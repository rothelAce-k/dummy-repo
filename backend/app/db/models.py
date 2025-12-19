from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.app.db.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"

class LeakStatus(str, enum.Enum):
    NONE = "none"
    MICRO = "micro"
    SLOW = "slow"
    MEDIUM = "medium"
    CATASTROPHIC = "catastrophic"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.USER.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    datasets = relationship("Dataset", back_populates="owner")
    training_jobs = relationship("TrainingJob", back_populates="user")
    predictions = relationship("Prediction", back_populates="user")

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    file_path = Column(String(500))
    row_count = Column(Integer)
    column_count = Column(Integer)
    schema_info = Column(JSON)
    summary_stats = Column(JSON)
    is_synthetic = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="datasets")
    training_jobs = relationship("TrainingJob", back_populates="dataset")

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    model_type = Column(String(100))
    file_path = Column(String(500))
    metrics = Column(JSON)
    feature_importance = Column(JSON)
    hyperparameters = Column(JSON)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    training_job = relationship("TrainingJob", back_populates="model", uselist=False)
    predictions = relationship("Prediction", back_populates="model")

class TrainingJob(Base):
    __tablename__ = "training_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), default="pending")
    progress = Column(Float, default=0.0)
    error_message = Column(Text)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    user_id = Column(Integer, ForeignKey("users.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    model_id = Column(Integer, ForeignKey("ml_models.id"))
    config = Column(JSON)
    
    user = relationship("User", back_populates="training_jobs")
    dataset = relationship("Dataset", back_populates="training_jobs")
    model = relationship("MLModel", back_populates="training_job")

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    input_data = Column(JSON)
    leak_probability = Column(Float)
    leak_class = Column(String(50))
    anomaly_score = Column(Float)
    recommended_action = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    model_id = Column(Integer, ForeignKey("ml_models.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="predictions")
    model = relationship("MLModel", back_populates="predictions")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(50))
    leak_class = Column(String(50))
    message = Column(Text)
    sensor_data = Column(JSON)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20))
    message = Column(Text)
    module = Column(String(100))
    user_id = Column(Integer, ForeignKey("users.id"))
    extra_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
