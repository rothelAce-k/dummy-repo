
// Deterministic Mock Data Generator for Investigation Reports
// Simulates a sophisticated ML Model (v4.2) output

export const getInvestigationData = (segmentId) => {
    // Default: Healthy / No Incident
    if (segmentId !== 'C-D') return null;

    // SCENARIO: Segment C-D H2S Leak
    return {
        id: 'RPT-2026-X89',
        generatedAt: new Date().toISOString(),
        verifiedBy: 'AIPIS Neural Engine v4.2',

        // 0. ASSET METADATA
        asset: {
            name: 'Pipeline Segment C-D',
            location: 'Sector 4 [Coordinates: 34.05N, 118.24W]',
            material: 'Carbon Steel (API 5L Grade X65)',
            installDate: '2018-04-12',
            lastInspection: '2025-11-30'
        },

        // 0.1 DATA VALIDITY (New)
        sensorHealth: [
            { id: 'P-104 (Pressure)', status: 'Online', calibDate: '2025-12-01', signalQuality: '99.8%' },
            { id: 'V-202 (Vib)', status: 'Online', calibDate: '2025-11-15', signalQuality: '98.5%' },
            { id: 'C-305 (Corr)', status: 'Drift Warning', calibDate: '2025-08-20', signalQuality: '84.2%' } // Hints at why the root cause was 'unchecked'
        ],

        // 1. THE VERDICT (Classification)
        verdict: {
            title: 'Material Failure Detected',
            subtitle: 'Stress Corrosion Cracking (SCC) - Type B',
            alertLevel: 'CRITICAL',
            confidence: 98.4,
            logic: [
                { condition: 'H2S Corrosion > 0.12mm/y', met: true },
                { condition: 'Acoustic Emission > 20kHz', met: true },
                { condition: 'Pressure Gradient < -10%', met: true }
            ]
        },

        // 2. PATTERN RECOGNITION (Case-Based Reasoning)
        patternMatch: {
            matchName: 'Sulfide Stress Profile #882',
            similarity: 98.4,
            historicalCases: 14,
            description: 'Primary failure mode confirmed by converging H2S readings and high-frequency acoustic emissions. Pattern matches known "Sulfide Stress" signatures observed in Sector 7 logs.'
        },

        // 3. OPERATIONAL IMPACT (Business Logic)
        impact: {
            volumeLost: '28,500 L (Processed Water)',
            costEstimate: '$42,500 (Inc. Hazmat Cleanup)',
            envRisk: 'CRITICAL (H2S Contamination)',
            regulatoryFine: 'Likely ($10k-$50k bracket)',
            downtimeEst: '8-12 Hours (Hazmat Protocol)'
        },

        // 4. ACTION PROTOCOL
        recommendations: [
            { type: 'Immediate', action: 'Deploy Hazmat Response Team (Protocol H2S-7)' },
            { type: 'Secondary', action: 'Initiate Section Isolation (Valve V-C)' },
            { type: 'Follow-up', action: 'Schedule Pipe Segment Replacement' }
        ],

        // 5. MAINTENANCE AUDIT
        maintenanceHistory: [
            { date: '2025-11-30', type: 'Routine Inspection', technician: 'Tech-142', status: 'Pass' },
            { date: '2025-06-15', type: 'Valve Calibration', technician: 'Tech-089', status: 'Adjusted' },
            { date: '2024-12-10', type: 'UT Wall Thickness', technician: 'External-Vendor', status: 'Warning (Minor Erosion)' }
        ],

        // 6. COMPLIANCE CHECK
        compliance: [
            { standard: 'API 570', desc: 'Piping Inspection Code', status: 'NON-COMPLIANT', alert: true },
            { standard: 'ISO 55000', desc: 'Asset Management', status: 'Flagged for Review', alert: false },
            { standard: 'OSHA 1910', desc: 'Hazardous Materials', status: 'Critical Risk', alert: true }
        ],

        // 7. ROOT CAUSE ANALYSIS
        rca: {
            rootCause: 'Sulfidation Corrosion (H2S)',
            contributingFactors: ['Moisture Ingress', 'Micro-fractures in coating'],
            fiveWhys: [
                'Why did it fail? -> Stress Concentration at Weld Joint C-4.',
                'Why stress concentration? -> Localized wall thinning (loss of < 0.2mm).',
                'Why wall thinning? -> Unchecked H2S corrosion rates (>0.1mm/y).',
                'Why unchecked? -> Sensor drift prevented early warning (until now).',
                'Root Cause -> Sensor Calibration Interval exceeded by 3 months.'
            ]
        },

        // 8. CHARTS DATA (30 Day High Res)
        charts: {
            // Dual Axis: Pressure (Dropping) vs Corrosion (Rising)
            trends: Array.from({ length: 30 }, (_, i) => ({
                day: `Day ${i + 1}`,
                pressure: 85 - (i * 0.5) - (Math.random() * 2), // Gradual drop from 85 to ~70
                corrosion: 0.04 + (i * 0.004) + (Math.random() * 0.001) // Gradual rise from 0.04 to ~0.16
            })),

            // FFT Spectrum (Vibration Frequency)
            fft: [
                { freq: '0-10Hz', amp: 10, type: 'Background' },
                { freq: '10-50Hz', amp: 15, type: 'Flow Noise' },
                { freq: '50-100Hz', amp: 12, type: 'Pump Harmonics' },
                { freq: '1-5kHz', amp: 5, type: 'Resonance' },
                { freq: '20-25kHz', amp: 85, type: 'Leak Signature (Hiss)' } // The Signal
            ],

            // Feature Importance (SHAP)
            features: [
                { name: 'Corrosion Rate', value: 65, color: '#e11d48' },
                { name: 'Pressure Drop', value: 25, color: '#f59e0b' },
                { name: 'Vibration RMS', value: 10, color: '#3b82f6' }
            ],

            // 8.1 NEW CHARTS DATA
            // Sensor Cross-Correlation Matrix (Pearson r)
            correlations: [
                { pair: 'H2S vs Corrosion', r: 0.99, significance: 'Very High' },
                { pair: 'Pressure vs H2S', r: -0.95, significance: 'High Inverse' },
                { pair: 'Vibration vs Flow', r: 0.12, significance: 'Low / Noise' }
            ],

            // Pressure Distribution Histogram
            pressureDist: [
                { range: '<50', count: 2 },
                { range: '50-60', count: 5 },
                { range: '60-70', count: 12 },
                { range: '70-80', count: 28 },
                { range: '80-90', count: 45 }, // Normal
                { range: '>90', count: 8 }
            ]
        }
    };
};
