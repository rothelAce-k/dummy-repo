import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

class SyntheticDataGenerator:
    """
    Robust Synthetic Data Generator for LeakGuard.
    
    Generates training data covering:
    - Normal Operation (100-150 PSI)
    - Early Deviation (95-100 PSI)
    - Micro Leak (90-95 PSI)
    - Medium Leak (80-90 PSI)
    - Major Leak (< 80 PSI)
    """
    
    def __init__(self, start_time: datetime = None):
        self.start_time = start_time or datetime.now()
        
    def generate_segment(self, 
                         duration_minutes: int, 
                         scenario: str,
                         noise_level: float = 0.02) -> pd.DataFrame:
        """
        Generate a data segment for a specific scenario.
        """
        n_points = int(duration_minutes * 60) # 1 Hz
        timestamps = [self.start_time + timedelta(seconds=i) for i in range(n_points)]
        
        # Base parameters based on Global Definitions
        # PSI ranges are non-negotiable
        if scenario == 'normal':
            base_pressure = np.random.uniform(105, 145) # Well inside 100-150
            pressure_trend = np.random.uniform(-0.1, 0.1, n_points) # Stable
            leak_class = 'none'
            
        elif scenario == 'early_deviation':
            # 95-100 PSI
            base_pressure = np.random.uniform(96, 99)
            pressure_trend = np.linspace(0, -1, n_points) # Slight drift down
            leak_class = 'none' # Still technically safe but warning territory
            
        elif scenario == 'micro_leak':
            # 90-95 PSI
            base_pressure = np.random.uniform(91, 94)
            pressure_trend = np.linspace(0, -2, n_points) # Clear drop
            leak_class = 'micro'
            
        elif scenario == 'medium_leak':
            # 80-90 PSI
            base_pressure_start = 89
            base_pressure_end = 81
            pressure_trend = np.linspace(0, base_pressure_end - base_pressure_start, n_points)
            base_pressure = base_pressure_start
            leak_class = 'slow' # Maps to 'slow'/'medium' in logic
            
        elif scenario == 'major_leak':
            # < 80 PSI
            base_pressure = np.random.uniform(40, 75)
            pressure_trend = np.linspace(0, -10, n_points) # Rapid loss
            leak_class = 'catastrophic'
            
        else: # Default Normal
            base_pressure = 120
            pressure_trend = np.zeros(n_points)
            leak_class = 'none'

        # Generate Core Signals
        # 1. Pressure
        noise = np.random.normal(0, base_pressure * noise_level, n_points)
        pressure = base_pressure + pressure_trend + noise
        
        # Clip pressure to enforce definitions strictness (optional but good for training purity)
        # For 'major', max is 79. For 'normal', min is 100.
        if scenario == 'major_leak':
            pressure = np.minimum(pressure, 79.9)
        if scenario == 'normal':
            pressure = np.maximum(pressure, 100.1)

        # 2. Flow Rate (LPM)
        # Normal: Proportional to pressure (Bernoulli-ish)
        # Leak: Flow increases while pressure drops (Loss of containment)
        if 'leak' in scenario:
             # Leak flow adds to system flow but pressure drops? 
             # Or simplified: Flow usually drops if pump can't keep up, OR 
             # if we measure flow *into* feature, a leak downstream increases flow.
             # Let's assume flow meter is at source. Leak = Higher Flow.
             base_flow = 50 + (150 - pressure) * 0.5 # Inverse relationship for leak
        else:
             base_flow = 50 + (pressure - 100) * 0.2 # Positive correlation for valid system
        
        flow_noise = np.random.normal(0, 2.0, n_points)
        flow = base_flow + flow_noise

        # 3. Vibration
        # Leaks cause turbulence = higher vibration
        if 'leak' in scenario:
            base_vib = 0.5 + (100 - pressure) * 0.02 # Higher pressure drop = more vib
        else:
            base_vib = 0.1
        
        vib_noise = np.random.normal(0, 0.05, n_points)
        vibration = np.abs(base_vib + vib_noise)

        # 4. Acoustic
        # Leaks are loud (high frequency hiss)
        if 'leak' in scenario:
            base_db = 60 + (100 - pressure) * 0.5
        else:
            base_db = 40
        
        acoustic_noise = np.random.normal(0, 5, n_points)
        acoustic = base_db + acoustic_noise
        
        # 5. Temperature (External factor, mostly independent but seasonal)
        base_temp = 25 + np.sin(np.linspace(0, 3, n_points)) * 5
        temp = base_temp + np.random.normal(0, 0.5, n_points)

        # Assemble DataFrame
        df = pd.DataFrame({
            'timestamp': timestamps,
            'pressure_psi': pressure,
            'flow_rate_lpm': flow,
            'temperature_c': temp,
            'vibration_gforce': vibration,
            'acoustic_db': acoustic,
            'leak_status': leak_class,
            'scenario': scenario # Helper col, remove before training if needed
        })
        
        # Advance time for next segment
        self.start_time = timestamps[-1] + timedelta(seconds=1)
        
        return df

    def generate_full_dataset(self, n_samples: int = 50000) -> pd.DataFrame:
        """
        Generate a mixed dataset covering all scenarios.
        """
        print(f"Generating synthetic dataset with aim of ~{n_samples} samples...")
        
        dfs = []
        current_samples = 0
        
        # Scenarios distribution
        # Normal: 50%
        # Early Dev: 10%
        # Micro: 15%
        # Medium: 15%
        # Major: 10%
        
        distribution = {
            'normal': 0.5,
            'early_deviation': 0.1,
            'micro_leak': 0.15,
            'medium_leak': 0.15,
            'major_leak': 0.1
        }
        
        # Average segment length (e.g., 5 minutes) to ensure better mixing
        segment_len = 5
        
        while current_samples < n_samples:
            # Pick scenario
            scenario = np.random.choice(
                list(distribution.keys()), 
                p=list(distribution.values())
            )
            
            df_seg = self.generate_segment(segment_len, scenario)
            dfs.append(df_seg)
            current_samples += len(df_seg)
            
        full_df = pd.concat(dfs, ignore_index=True)
        # Trim to exact size if needed, or keep all
        
        print(f"Generated {len(full_df)} samples.")
        return full_df

if __name__ == "__main__":
    gen = SyntheticDataGenerator()
    df = gen.generate_full_dataset(n_samples=1000)
    print(df.head())
    print(df['leak_status'].value_counts())
    print(df.groupby('scenario')['pressure_psi'].agg(['min', 'max', 'mean']))
