from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import os

from backend.app.core.config import settings
from backend.app.db.database import init_db
from backend.app.api.routes import auth_routes, data_routes, leak_routes, admin_routes
from backend.app.ml.loader import ModelLoader

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI platform for industrial leak detection using IoT sensor data",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__}
    )

app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(data_routes.router, prefix="/api/v1")
app.include_router(leak_routes.router, prefix="/api/v1")
app.include_router(admin_routes.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    init_db()
    
    os.makedirs(settings.MODEL_PATH, exist_ok=True)
    os.makedirs(settings.UPLOAD_PATH, exist_ok=True)
    
    # Initialize Model
    try:
        model = ModelLoader.get_model()
        if model:
            print("Model loaded successfully on startup")
    except Exception as e:
         print(f"Model load warning: {e}")
         print("Validation/Inference will fail until a model is trained.")


@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/status")
async def api_status():
    info = ModelLoader.get_info()
    
    return {
        "api_version": "v1",
        "status": "operational",
        "model_status": info.get("status", "unknown"),
        "endpoints": {
            "auth": "/api/v1/auth",
            "data": "/api/v1/data",
            "leak": "/api/v1/leak",
            "admin": "/api/v1/admin"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
