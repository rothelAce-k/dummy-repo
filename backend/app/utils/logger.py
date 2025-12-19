import logging
import sys
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.db.repositories import SystemLogRepository

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

class DatabaseLogger:
    def __init__(self, db: Session, module: str):
        self.db = db
        self.module = module
        self.logger = get_logger(module)
    
    def info(self, message: str, user_id: Optional[int] = None, metadata: Optional[dict] = None):
        self.logger.info(message)
        self._save_to_db("INFO", message, user_id, metadata)
    
    def warning(self, message: str, user_id: Optional[int] = None, metadata: Optional[dict] = None):
        self.logger.warning(message)
        self._save_to_db("WARNING", message, user_id, metadata)
    
    def error(self, message: str, user_id: Optional[int] = None, metadata: Optional[dict] = None):
        self.logger.error(message)
        self._save_to_db("ERROR", message, user_id, metadata)
    
    def critical(self, message: str, user_id: Optional[int] = None, metadata: Optional[dict] = None):
        self.logger.critical(message)
        self._save_to_db("CRITICAL", message, user_id, metadata)
    
    def _save_to_db(self, level: str, message: str, user_id: Optional[int], metadata: Optional[dict]):
        try:
            SystemLogRepository.create(
                self.db,
                level=level,
                message=message,
                module=self.module,
                user_id=user_id,
                metadata=metadata
            )
        except Exception as e:
            self.logger.error(f"Failed to save log to database: {e}")

logger = get_logger("leak_detection")
