import os
import pickle
import traceback
from typing import Optional, Dict, Any, List
from backend.app.core.config import settings
from backend.app.ml.pipeline import LeakDetectionPipeline

class ModelLoader:
    _instance = None
    _model: Optional[LeakDetectionPipeline] = None
    
    @classmethod
    def get_model(cls) -> Optional[LeakDetectionPipeline]:
        """
        Get the loaded model instance. Loads it if not already loaded.
        """
        if cls._model is None:
            cls.load_model()
        return cls._model

    @classmethod
    def load_model(cls) -> bool:
        """
        Load the model from disk.
        """
        model_path = os.path.join(settings.MODEL_PATH, "leak_model.pkl")
        
        if not os.path.exists(model_path):
            print(f"WARNING: Model not found at {model_path}")
            return False
            
        try:
            with open(model_path, 'rb') as f:
                cls._model = pickle.load(f)
            print(f"SUCCESS: Loaded model from {model_path}")
            return True
        except Exception as e:
            print(f"ERROR: Failed to load model: {e}")
            traceback.print_exc()
            return False

    @staticmethod
    def get_info() -> Dict[str, Any]:
        """
        Get metadata about the loaded model.
        """
        if ModelLoader._model is None:
             if not ModelLoader.load_model():
                 return {"status": "not_loaded", "error": "Model file missing or invalid"}
        
        try:
            # Inspect the pipeline
            pipeline = ModelLoader._model
            info = {
                "status": "active",
                "type": "LeakDetectionPipeline",
                "steps": [name for name, _ in pipeline.full_pipeline.steps],
                "numeric_features": pipeline.numeric_features,
                "metrics": getattr(pipeline, "metadata", {})
            }
            return info
        except:
             return {"status": "error", "error": "Could not inspect model"}

    @staticmethod
    def predict(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Run inference on a list of input dictionaries.
        """
        model = ModelLoader.get_model()
        if not model:
            raise RuntimeError("Model is not loaded")
        
        # Pipeline handles list of dicts -> DataFrame conversion internally via FeatureEngineer?
        # Check pipeline.py: FeatureEngineer.transform check if isinstance(X, pd.DataFrame).
        # Need to ensure we pass something the pipeline accepts. 
        # Pipeline is: Engineer -> Preprocess -> Model.
        # Engineer transform expects DataFrame or List[Dict]?
        # "if not isinstance(X, pd.DataFrame): X = pd.DataFrame(X)"
        # So passing list of dicts is fine!
        
        if not data:
            return []
            
        try:
            # Predict Proba
            probas = model.predict_proba(data) # shape (n_samples, n_classes)
            classes = model.full_pipeline.classes_ # Standard sklearn classifier property
            
            # Predict Class
            preds = model.predict(data)
            
            results = []
            for i, pred_class in enumerate(preds):
                # Find probability of the predicted class or max prob?
                # Usually we want probability of "leak" vs "no leak" or specific class probability
                # Since it's multi-class (none, micro, slow, catastrophic), let's give the max prob.
                
                # probas[i] is array of probs for each class
                max_prob = float(max(probas[i]))
                
                # Logic for Severity/Action (Centralized here or map from class?)
                # The Class map is now grounded in Truth:
                # 'none' -> Normal
                # 'micro' -> Info/Warning
                # 'slow' -> High
                # 'catastrophic' -> Critical
                
                severity_map = {
                    'none': 'info',
                    'micro': 'warning',
                    'slow': 'high',
                    'catastrophic': 'critical'
                }
                
                results.append({
                    "leak_class": pred_class,
                    "leak_probability": max_prob,
                    "severity": severity_map.get(pred_class, 'unknown'),
                    "anomaly_score": max_prob * 100 if pred_class != 'none' else 0 # Simple score logic
                })
                
            return results
            
        except Exception as e:
            traceback.print_exc()
            raise e
