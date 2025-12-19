# LEAKGUARD AI - MASTER TECHNICAL DOCUMENTATION
**Version:** 2.0 (Enterprise Edition)
**Date:** December 2025
**System Type:** Industrial IoT & Predictive Maintenance Platform

---

## 1. EXECUTIVE SUMMARY
**LeakGuard AI** is an advanced, full-stack predictive maintenance system designed for Critical Infrastructure (pipelines, chemical plants, water treatment facilities). Unlike traditional threshold-based alarm systems, LeakGuard utilizes **Machine Learning (Random Forest/Ensemble)** to detect subtle anomalies in sensor data—identifying "Micro Leaks" (catastrophic precursors) before they become disasters.

The system provides end-to-end capabilities: from **Synthetic Data Generation (Physics-based)** to **Model Training**, **Real-time Inference**, and **Strategic Operational Dashboards**.

---

## 2. FUNCTIONAL PURPOSE & TARGET
### **Core Purpose**
To minimize downtime and environmental hazards by predicting structural failures. The system shifts maintenance strategy from **Reactive** ("Fix it when it breaks") to **Predictive** ("Fix it because the AI detects signature #42").

### **Target Audience**
*   **Operations Managers**: For health scores (`HealthMonitor`) and high-level KPIs.
*   **Field Engineers**: For precise leak localization (`LeakDetection`) and sensor diagnostics.
*   **Data Scientists**: For model retraining and dataset management (`ModelMetrics`).

---

## 3. SYSTEM ARCHITECTURE
The application follows a loosely coupled **Microservices-style** architecture (Monolithic Repo).

### **High-Level Flow**
`[Sensors / CSV Upload]` --> `[FastAPI Backend]` --> `[ML Inference Engine]` --> `[React Frontend]`

### **Technology Stack**

#### **A. Frontend (The Control Center)**
*   **Framework**: React 18 + Vite (Ultra-fast build)
*   **Styling**: TailwindCSS (Utility-first, Custom "Industrial Dark" Theme)
*   **Visualization**:
    *   `Recharts`: For time-series analysis (pressure/flow trends).
    *   `React-Leaflet`: For geospatial sensor mapping.
    *   `Lucide-React`: Consistent iconography.
*   **State Management**: `TenStack Query` (React Query) for server-state synchronization and caching.

#### **B. Backend (The Brain)**
*   **Framework**: FastAPI (Python 3.10+) - High performance, async-native.
*   **Database**: SQLite (via SQLAlchemy ORM) for localized deployment, extensible to PostgreSQL.
*   **Validation**: Pydantic v2 for strict data schemas.
*   **Security**: OAuth2 with Password Flow (JWT Tokens).

#### **C. ML Engine (The Core Intelligence)**
*   **Library**: Scikit-Learn (RandomForestClassifier).
*   **Serialization**: `pickle` for model persistence.
*   **Pipeline**: Custom `FeatureEngineer` preprocessing steps + Scaler + Classifier.

---

## 4. MODULE DEEP DIVE

### **I. Frontend Modules**

#### **1. Main Dashboard (`Dashboard.jsx`)**
*   **Purpose**: Real-time situation awareness.
*   **Key Features**:
    *   **Operational Health**: Tracks Uptime, Latency, and Pipeline Integrity.
    *   **Confidence Monitor**: Displays Model Certainty (Fixed target: 94.1%).
    *   **Sparklines**: Visualizes immediate trends in API throughput.

#### **2. Health Monitoring (`HealthMonitor.jsx`)**
*   **Type**: Strategic Dashboard.
*   **Features**:
    *   **Physics Engine**: Simulates scenarios (Corrosion, Flow Resistance, Cavitation) based on selected Zones.
    *   **Zone Selector**: Context-aware switching (Zone 1 Pump vs. Safety Valve).
    *   **4-Zone Layout**: Verdict (Gauge) -> Trend (30d Chart) -> Drivers (Physics) -> Action (Work Order).

#### **3. Sensor Monitor (`SensorMonitor.jsx`)**
*   **Type**: Tactical Map View.
*   **Features**:
    *   **Geospatial Integration**: Interactive Map combining Leaflet markers with live chart data.
    *   **Selection Logic**: "All Sensors" (Overview) vs. Single Sensor (Deep Dive zoom).

#### **4. Leak Detection (`LeakDetection.jsx`)**
*   **Type**: Forensic/Action View.
*   **Features**:
    *   **Live Inference**: Upload CSV data to get row-by-row predictions.
    *   **Severity Categorization**: Normal / Slow Leak / Micro Leak / Catastrophic.

---

### **II. Backend Services**

#### **1. Data Routes (`data_routes.py`)**
*   Handles CSV file ingestion.
*   Parses "raw" industrial data headers.
*   Stores datasets in SQLite for audit trails.

#### **2. ML Pipeline (`pipeline.py` & `loader.py`)**
*   **Loader**: Singleton pattern to load `.pkl` models from disk efficiently.
*   **Inference**:
    1.  Receives JSON payload.
    2.  `FeatureEngineer`: Calculates derivatives (e.g., `Pressure_Diff`, `Flow_Velocity`).
    3.  `Predict`: Returns Class + Probability (Confidence).

#### **3. Synthetic Generator (`generator.py`)**
*   **Physics-Based Simulation**: Generates training data by simulating fluid dynamics variables (Bernoulli's principle proxies) to create realistic "Leak" signatures without needing millions of real failure events.

---

## 5. MACHINE LEARNING STRATEGY

### **Model Type: Random Forest Classifier**
We chose Random Forest for:
1.  **Interpretability**: Feature importance extraction (knowing *why* a leak was detected).
2.  **Robustness**: Handles non-linear relationships between Pressure and Vibration well.
3.  **Speed**: Sub-millisecond inference time.

### **Features Used**
*   `Pressure (PSI)`: Primary variable.
*   `Flow Rate (LPM)`: Mass balance check.
*   `Vibration (Hz)`: Mechanical stability.
*   `Temperature (C)`: Thermodynamic state.
*   **Computed**: Delta variations over rolling windows.

---

## 6. OPERATIONAL GUIDE (How to Run)

### **Prerequisites**
*   Python 3.10+
*   Node.js 18+

### **Startup Sequence**
1.  **Backend Initialization**:
    ```bash
    python run_backend.py
    # Starts Uvicorn Server @ http://localhost:8000
    ```
    *Loads the latest model from `ml_models/` automatically.*

2.  **Frontend Initialization**:
    ```bash
    cd frontend
    npm run dev
    # Starts Vite Server @ http://localhost:5000
    ```

---

## 7. FUTURE ROADMAP (Pro Recommendations)
1.  **Containerization**: Dockerize Backend and Frontend for Kubernetes deployment.
2.  **Edge Deployment**: Convert `.pkl` model to start OpenVINO/ONNX for deployment on Raspberry Pi edge gateways.
3.  **Digital Twin**: Connect `HealthMonitor` scenarios to real-time PLC inputs via Modbus/OPC-UA.

---
*Generated by Clean Code Agent - 2025*
