from fastapi import HTTPException, status
from typing import Optional, Any

class BaseAPIException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class AuthenticationError(BaseAPIException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class AuthorizationError(BaseAPIException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)

class NotFoundError(BaseAPIException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)

class ValidationError(BaseAPIException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class ConflictError(BaseAPIException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT)

class ModelNotFoundError(BaseAPIException):
    def __init__(self, detail: str = "No trained model available"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)

class DatasetNotFoundError(BaseAPIException):
    def __init__(self, detail: str = "Dataset not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)

class TrainingError(BaseAPIException):
    def __init__(self, detail: str = "Model training failed"):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PredictionError(BaseAPIException):
    def __init__(self, detail: str = "Prediction failed"):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
