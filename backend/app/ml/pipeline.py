from typing import Dict, Any, List, Optional, Union
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Deterministic Feature Engineering for LeakGuard.
    
    Transforms raw sensor data into physics-informed features.
    This logic is identical for both training and inference.
    """
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        """
        X can be a DataFrame or a list of dicts.
        Returns a DataFrame with engineered features.
        """
        # Ensure X is a DataFrame
        if not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)
        
        # Work on a copy to prevent side effects
        df = X.copy()
        
        # --- Physics-Informed Features ---
        
        # 1. Flow-to-Pressure Ratio
        # Normal operation: Flow matches pressure linearly (approx).
        # Leak: Flow increases or Pressure drops -> Ratio changes.
        # Add epsilon to avoid divide by zero.
        if 'flow_rate_lpm' in df.columns and 'pressure_psi' in df.columns:
            df['flow_pressure_ratio'] = df['flow_rate_lpm'] / (df['pressure_psi'] + 1e-6)
        
        # 2. Vibration RMS (Approximate from single point if raw signal unavailable)
        # If we have 'vibration_gforce', assume it's a peak or instant value.
        # RMS = Peak * 0.707 for sine waves (common approximations for sensors).
        if 'vibration_gforce' in df.columns:
            df['vibration_rms'] = df['vibration_gforce'] * 0.707
            
        # 3. Acoustic Energy (Log scale handling/normalization could go here)
        # For now, raw acoustic_db is a strong feature itself.
        
        # 4. Interaction Features
        if 'temperature_c' in df.columns and 'pressure_psi' in df.columns:
             # Temp compensated pressure (Ideal Gas Law inspiration) - minimal effect for liquid but helps robustness
            df['pressure_temp_interaction'] = df['pressure_psi'] * (df['temperature_c'] + 273.15) / 293.15
            
        return df

class LeakDetectionPipeline(BaseEstimator, ClassifierMixin):
    """
    The Single Source of Truth for LeakGuard ML.
    
    Wraps:
    1. Feature Engineering
    2. Preprocessing (Scaling/Imputing)
    3. Classification Model
    """
    def __init__(self):
        self.feature_engineer = FeatureEngineer()
        
        # Define necessary numeric columns for scaling
        self.numeric_features = [
            'pressure_psi', 'flow_rate_lpm', 'temperature_c', 
            'vibration_gforce', 'acoustic_db',
            'flow_pressure_ratio', 'vibration_rms', 'pressure_temp_interaction'
        ]
        
        # Preprocessor: Impute missing -> Scale
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', Pipeline(steps=[
                    ('imputer', SimpleImputer(strategy='median')), # Robust to outliers
                    ('scaler', StandardScaler())
                ]), self.numeric_features)
            ],
            remainder='drop' # Strictly drop unknown/unused columns
        )
        
        # Model: Random Forest
        # Robust, handles non-linearities, provides feature importance.
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced' # Handle class imbalance (leaks are rarer)
        )
        
        self.full_pipeline = Pipeline([
            ('engineer', self.feature_engineer),
            ('preprocess', self.preprocessor),
            ('classifier', self.model)
        ])
        
        self.metadata: Dict[str, Any] = {}
        
    def fit(self, X, y):
        """
        Fit the entire pipeline.
        X: Raw DataFrame from generator.
        y: Labels.
        """
        self.full_pipeline.fit(X, y)
        return self

    def predict(self, X):
        """
        Predict using the full pipeline.
        X: Raw input (dict or DF).
        """
        return self.full_pipeline.predict(X)

    def predict_proba(self, X):
        """
        Get probabilities.
        """
        return self.full_pipeline.predict_proba(X)
    
    def get_feature_importance(self):
        """
        Return feature importance dict.
        """
        try:
             # Access the classifier step
            rf = self.full_pipeline.named_steps['classifier']
            importances = rf.feature_importances_
            return dict(zip(self.numeric_features, importances))
        except:
            return {}

if __name__ == "__main__":
    # Quick sanity check
    print("Initializing Pipeline...")
    pipeline = LeakDetectionPipeline()
    print("Pipeline Initialized.")
