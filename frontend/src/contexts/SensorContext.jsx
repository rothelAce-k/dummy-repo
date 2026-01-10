import React, { createContext, useContext, useState, useEffect } from 'react';

const SensorContext = createContext();

export const useSensor = () => {
    const context = useContext(SensorContext);
    if (!context) {
        throw new Error('useSensor must be used within a SensorProvider');
    }
    return context;
};

// Simplified Topology: Left to Right
const INITIAL_SENSORS = [
    { id: 'SENSOR_A', name: 'Sensor A', status: 'normal', lat: 51.505, lng: -0.15, location: 'Pipeline Segment 1', corrosion: 0.042 },
    { id: 'SENSOR_B', name: 'Sensor B', status: 'normal', lat: 51.508, lng: -0.12, location: 'Pipeline Segment 2', corrosion: 0.045 },
    { id: 'SENSOR_C', name: 'Sensor C', status: 'normal', lat: 51.512, lng: -0.09, location: 'Pipeline Segment 3', corrosion: 0.125 }, // Higher
    { id: 'SENSOR_D', name: 'Sensor D', status: 'normal', lat: 51.509, lng: -0.06, location: 'Pipeline Segment 4', corrosion: 0.148 }, // Peak
    { id: 'SENSOR_E', name: 'Sensor E', status: 'normal', lat: 51.506, lng: -0.03, location: 'Pipeline Segment 5', corrosion: 0.052 },
];

export const SensorProvider = ({ children }) => {
    const [sensors, setSensors] = useState(INITIAL_SENSORS);

    // Init history with 30 mock data points (approx 1 minute)
    const [history, setHistory] = useState(() => {
        const h = [];
        const start = new Date();
        start.setSeconds(start.getSeconds() - 60);
        for (let i = 0; i < 30; i++) {
            start.setSeconds(start.getSeconds() + 2);
            const t = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            h.push({ time: t, pressure: 80 + Math.random(), flow: 45 + Math.random(), temp: 22, vibration: 0.1, corrosion: 0.05 });
        }
        return h;
    });

    const [systemHealth, setSystemHealth] = useState(100.0);
    const [isLive, setIsLive] = useState(true);
    const [isDiagnosing, setIsDiagnosing] = useState(false);

    // Global Diagnostics Handler
    const runDiagnostics = async (onComplete) => {
        setIsDiagnosing(true);
        setIsLive(false); // Pause live feed

        // Simulate 6-second diagnostic run
        return new Promise((resolve) => {
            setTimeout(() => {
                setIsDiagnosing(false);
                setIsLive(true); // Resume live feed
                if (onComplete) onComplete();
                resolve();
            }, 6000);
        });
    };

    // REALISTIC STATE --
    // We track "Health" as a persistent value that changes slowly, not randomly.
    const [segmentHealth, setSegmentHealth] = useState({
        'A-B': 100,
        'B-C': 99.8,
        'C-D': 88.5, // Clearly in Warning zone (<90)
        'D-E': 99.5
    });

    // Simulation Logic
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            const now = new Date();
            const timeLabel = now.toLocaleTimeString();

            // 1. GLOBAL PHYSICS WAVE (Correlated Data)
            // Simulate a pressure wave that affects the specific "hour". 
            // This makes A-E look relatable.
            const timeOffset = Date.now() / 10000; // Slowly moving base
            const globalPressure = 80 + (Math.sin(timeOffset) * 5); // Sine wave 75-85
            const globalFlow = 45 + (Math.cos(timeOffset) * 3); // Cosine wave 42-48

            // 2. STABLE HEALTH (Long-term)
            setSegmentHealth(prev => {
                // Tiny breathing to make it look alive but mostly static
                return { ...prev };
            });

            // 3. Update Sensor Status
            setSensors(prevSensors => {
                return prevSensors.map(s => {
                    let status = 'normal';
                    let healthToCheck = 100;
                    if (s.id === 'SENSOR_A' || s.id === 'SENSOR_B') healthToCheck = segmentHealth['A-B'];
                    if (s.id === 'SENSOR_B' || s.id === 'SENSOR_C') healthToCheck = segmentHealth['B-C'];
                    if (s.id === 'SENSOR_C' || s.id === 'SENSOR_D') healthToCheck = segmentHealth['C-D'];
                    if (s.id === 'SENSOR_E') healthToCheck = segmentHealth['D-E'];

                    // Logic: 90-100 Normal, 75-90 Warning, <75 Critical
                    if (healthToCheck < 75) status = 'critical';
                    else if (healthToCheck < 90) status = 'warning';

                    return { ...s, status };
                });
            });

            // 4. Global Stats
            setSystemHealth(prev => {
                const values = Object.values(segmentHealth);
                const minVal = Math.min(...values);
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                return (avg * 0.7) + (minVal * 0.3);
            });

            // 5. GENERATE LIVE TELEMETRY (Real-Time)
            // We use actual clock time. The chart represents "Live" conditions.
            setHistory(prev => {
                const now = new Date();
                const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                // C-D Health impact on global wave
                const deterioration = (100 - segmentHealth['C-D']) / 100; // 0.08 roughly

                const newDataPoint = {
                    time: timeLabel, // "14:30:05"
                    pressure: globalPressure + (Math.random()),
                    flow: globalFlow - (deterioration * 5) + (Math.random()),
                    temp: 22 + (Math.sin(timeOffset * 2)),
                    vibration: 0.1 + (deterioration * 0.5)
                };

                const newHist = [...prev, newDataPoint];
                // Keep last 30 points (approx 1 minute of data at 2s interval)
                if (newHist.length > 30) return newHist.slice(newHist.length - 30);
                return newHist;
            });

        }, 2000); // Live updates every 2 seconds

        return () => clearInterval(interval);
    }, [isLive, segmentHealth]);

    // Specific reading getter using Global Wave
    const getSensorReading = (sensorId) => {
        // Retrieve latest history
        const latest = history[history.length - 1] || { pressure: 80, flow: 45, vibration: 0.1 };

        // Position Offset (Physical Distance along pipe)
        // A(0) -> B(1) -> C(2)...
        // Pressure drops slightly over distance (-0.5 per step)
        const idx = INITIAL_SENSORS.findIndex(s => s.id === sensorId);
        const distanceLoss = idx * 0.5;

        let val = { ...latest };
        val.pressure -= distanceLoss;

        // Specific Deviations
        // Specific Deviations
        // REALISTIC HYDRAULICS:
        // A leak in Segment C->D means pressure drops *across* the leak.
        // Sensor C (Upstream Inlet): Pressure remains relatively high (pump maintains it), maybe slight drop due to velocity increase.
        // Sensor D (Downstream Outlet): Massive pressure drop due to energy loss at the leak.

        if (sensorId === 'SENSOR_C') {
            // Upstream of leak (C):
            // 1. Flow INCREASES: Leak creates path of least resistance, drawing more fluid.
            val.flow *= 1.15;
            // 2. Pressure: Slight drop due to Bernoulli effect (higher velocity = lower pressure)
            val.pressure *= 0.99;
            // 3. Vibration: High turbulence
            val.vibration = (val.vibration * 1.3) + (Math.random() * 0.05);
            // 4. Temp: STABLE with micro-fluctuations (No drastic cooling)
            val.temp += (Math.random() * 0.02 - 0.01);
        } else if (sensorId === 'SENSOR_D') {
            // Downstream of leak (D):
            // 1. Flow DECREASES: Mass balance violation (Flow_Out < Flow_In)
            val.flow *= 0.80;
            // 2. Pressure: Major drop due to energy loss
            val.pressure *= 0.85;
            // 3. Vibration: Damped but erratic
            val.vibration = (val.vibration * 1.1) + (Math.random() * 0.02);
            // 4. Temp: Stable with slight sensor noise (No spikes)
            val.temp += (Math.random() * 0.04 - 0.02);
        } else if (sensorId === 'SENSOR_E') {
            // Further downstream
            val.pressure *= 0.84;
            val.flow *= 0.79; // Consistent mass loss
            val.vibration += (Math.random() * 0.01);
            val.temp += (Math.random() * 0.01 - 0.005);
        } else {
            // Normal sensors (A, B) - minimal noise
            val.vibration += (Math.random() * 0.005);
            val.temp += (Math.random() * 0.01 - 0.005);
        }


        // 5. CORROSION: Extremely Stable (Changes over months)
        // Retrieve specific sensor baseline (C/D are higher)
        // Use microscopic noise to simulate sensor resolution flicker
        const baseCorrosion = INITIAL_SENSORS[idx]?.corrosion || 0.05;
        val.corrosion = baseCorrosion + (Math.random() * 0.00001 - 0.000005);

        // Add tiny local noise so they aren't identical
        val.pressure += (Math.random() * 0.2 - 0.1);

        return val;
    };

    return (
        <SensorContext.Provider value={{
            sensors,
            history,
            systemHealth,
            segmentHealth, // Export explicit segment healths
            isLive,
            setIsLive,
            isDiagnosing,
            runDiagnostics,
            getSensorReading
        }}>
            {children}
        </SensorContext.Provider>
    );
};
