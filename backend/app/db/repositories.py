from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.models import User, Dataset, MLModel, TrainingJob, Prediction, Alert, SystemLog
from backend.app.core.security import get_password_hash

class UserRepository:
    @staticmethod
    def create(db: Session, email: str, username: str, password: str, role: str = "user") -> User:
        hashed_password = get_password_hash(password)
        user = User(email=email, username=username, hashed_password=hashed_password, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_role(db: Session, user_id: int, role: str) -> Optional[User]:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.role = role
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False

class DatasetRepository:
    @staticmethod
    def create(db: Session, name: str, owner_id: int, **kwargs) -> Dataset:
        dataset = Dataset(name=name, owner_id=owner_id, **kwargs)
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset
    
    @staticmethod
    def get_by_id(db: Session, dataset_id: int) -> Optional[Dataset]:
        return db.query(Dataset).filter(Dataset.id == dataset_id).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Dataset]:
        return db.query(Dataset).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_owner(db: Session, owner_id: int) -> List[Dataset]:
        return db.query(Dataset).filter(Dataset.owner_id == owner_id).all()

    @staticmethod
    def delete(db: Session, dataset_id: int) -> bool:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset:
            db.delete(dataset)
            db.commit()
            return True
        return False

class MLModelRepository:
    @staticmethod
    def create(db: Session, name: str, version: str, **kwargs) -> MLModel:
        model = MLModel(name=name, version=version, **kwargs)
        db.add(model)
        db.commit()
        db.refresh(model)
        return model
    
    @staticmethod
    def get_by_id(db: Session, model_id: int) -> Optional[MLModel]:
        return db.query(MLModel).filter(MLModel.id == model_id).first()
    
    @staticmethod
    def get_active(db: Session) -> Optional[MLModel]:
        return db.query(MLModel).filter(MLModel.is_active == True).first()
    
    @staticmethod
    def get_all(db: Session) -> List[MLModel]:
        return db.query(MLModel).all()
    
    @staticmethod
    def set_active(db: Session, model_id: int) -> Optional[MLModel]:
        db.query(MLModel).update({MLModel.is_active: False})
        model = db.query(MLModel).filter(MLModel.id == model_id).first()
        if model:
            model.is_active = True
            db.commit()
            db.refresh(model)
        return model

class TrainingJobRepository:
    @staticmethod
    def create(db: Session, user_id: int, dataset_id: int, **kwargs) -> TrainingJob:
        job = TrainingJob(user_id=user_id, dataset_id=dataset_id, **kwargs)
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    
    @staticmethod
    def get_by_id(db: Session, job_id: int) -> Optional[TrainingJob]:
        return db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
    
    @staticmethod
    def update_status(db: Session, job_id: int, status: str, progress: float = None, error: str = None) -> Optional[TrainingJob]:
        job = db.query(TrainingJob).filter(TrainingJob.id == job_id).first()
        if job:
            job.status = status
            if progress is not None:
                job.progress = progress
            if error:
                job.error_message = error
            db.commit()
            db.refresh(job)
        return job

class PredictionRepository:
    @staticmethod
    def create(db: Session, user_id: int, model_id: int, **kwargs) -> Prediction:
        prediction = Prediction(user_id=user_id, model_id=model_id, **kwargs)
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Prediction]:
        return db.query(Prediction).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Prediction]:
        return db.query(Prediction).filter(Prediction.user_id == user_id).all()

class AlertRepository:
    @staticmethod
    def create(db: Session, severity: str, leak_class: str, message: str, sensor_data: dict) -> Alert:
        alert = Alert(severity=severity, leak_class=leak_class, message=message, sensor_data=sensor_data)
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Alert]:
        return db.query(Alert).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def acknowledge(db: Session, alert_id: int, user_id: int) -> Optional[Alert]:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.is_acknowledged = True
            alert.acknowledged_by = user_id
            db.commit()
            db.refresh(alert)
        return alert

class SystemLogRepository:
    @staticmethod
    def create(db: Session, level: str, message: str, module: str, user_id: int = None, metadata: dict = None) -> SystemLog:
        log = SystemLog(level=level, message=message, module=module, user_id=user_id, extra_data=metadata)
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[SystemLog]:
        return db.query(SystemLog).order_by(SystemLog.created_at.desc()).offset(skip).limit(limit).all()
