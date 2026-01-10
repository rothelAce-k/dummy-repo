import os
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Leak Detection AI Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = Field(default="sqlite:///./sql_app.db")
    
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", alias="AIPIS_SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    CORS_ORIGINS: list = ["*"]
    
    
    MODEL_PATH: str = "ml_models"
    UPLOAD_PATH: str = Field(default="uploads", alias="UPLOAD_DIR")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        populate_by_name = True

settings = Settings()
