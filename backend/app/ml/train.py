import os
import pickle
import pandas as pd
from datetime import datetime
from sklearn.metrics import classification_report, confusion_matrix

from backend.app.ml.pipeline import LeakDetectionPipeline
from backend.app.ml.generator import SyntheticDataGenerator
from backend.app.core.config import settings

def train_and_save():
    print("=== LeakGuard Model Training Init ===")
    
    # 1. Generate Data
    print("\n[1/4] Generating Synthetic Data...")
    generator = SyntheticDataGenerator()
    # 50,000 samples for robust training
    raw_data = generator.generate_full_dataset(n_samples=50000)
    
    # Save raw training data for audit
    os.makedirs(settings.UPLOAD_PATH, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    train_file = os.path.join(settings.UPLOAD_PATH, f"training_data_{timestamp}.csv")
    raw_data.to_csv(train_file, index=False)
    print(f"Training data saved to {train_file}")
    
    # 2. Split Data
    X = raw_data.drop(['leak_status', 'scenario', 'timestamp'], axis=1)
    y = raw_data['leak_status']
    
    # 3. Initialize and Fit Pipeline
    print("\n[2/4] Training Unified Pipeline...")
    pipeline = LeakDetectionPipeline()
    pipeline.fit(X, y)
    
    # 4. Validation
    print("\n[3/4] Validating Model...")
    y_pred = pipeline.predict(X)
    report_dict = classification_report(y, y_pred, output_dict=True)
    report_str = classification_report(y, y_pred)
    
    print("\nClassification Report:")
    print(report_str)
    
    # Store metrics in pipeline metadata
    pipeline.metadata = {
        "accuracy": report_dict["accuracy"],
        "f1_score": report_dict["macro avg"]["f1-score"],
        "precision": report_dict["macro avg"]["precision"],
        "recall": report_dict["macro avg"]["recall"],
        "classification_report": report_dict,
        "trained_at": datetime.now().isoformat(),
        "dataset_size": len(raw_data)
    }
    
    # Feature Importance (best effort)
    try:
        pipeline.metadata["feature_importance"] = pipeline.get_feature_importance()
    except:
        pass
    print("\n[4/4] Saving Model Artifact...")
    model_dir = settings.MODEL_PATH
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "leak_model.pkl")
    
    # Save the entire pipeline object
    with open(model_path, 'wb') as f:
        pickle.dump(pipeline, f)
        
    print(f"SUCCESS: Model saved to {model_path}")
    print("System ready for inference.")

if __name__ == "__main__":
    train_and_save()
