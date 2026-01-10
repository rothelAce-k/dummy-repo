import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensor } from '../contexts/SensorContext';
import { CeramicCard } from '../components/ui/CeramicCard';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Maximize2, Activity, Wind, Droplets, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Placeholder for the complex SVG schematic
import PipelineSchematic from '../components/digital-twin/PipelineSchematic';

export default function DigitalTwin() {
    const { systemHealth, sensors, isLive } = useSensor();
    const navigate = useNavigate();
    const [focusedSensor, setFocusedSensor] = useState(null);

    // Calculate system stats for the header
    const avgPressure = sensors.length > 0 ? 'Normal' : '--';

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 space-y-6 animate-in fade-in duration-700">
            {/* Header / HUD */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        Digital Twin
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                            LIVE SYNC
                        </Badge>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                        Real-time holographic visualization of the physical pipeline topology.
                        Monitoring hydraulic dynamics and structural integrity.
                    </p>
                </div>

                {/* Global Status Pill */}
                <GlassCard className="px-5 py-2 flex items-center gap-6 rounded-full border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">System Online</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                    <div className="text-sm">
                        <span className="text-slate-500 mr-2">Health Index</span>
                        <span className={`font-bold ${systemHealth > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{systemHealth.toFixed(1)}%</span>
                    </div>
                </GlassCard>
            </div>

            {/* MAIN VIEWPORT */}
            <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-2xl group">
                {/* Background Grid - "Cyber" aesthetic */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* The Schematic Engine */}
                <PipelineSchematic
                    focusedSensor={focusedSensor}
                    setFocusedSensor={setFocusedSensor}
                />

                {/* Overlay Controls */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                    {/* Legend */}
                    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs text-slate-300 space-y-2 pointer-events-auto">
                        <div className="font-semibold text-white mb-1 uppercase tracking-wider">Topology Legend</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded-full" /> Laminar Flow</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-1 bg-amber-500 rounded-full" /> Turbulent / Warning</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-emerald-500 rounded-full" /> Active Sensor</div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS - Contextual to focus */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Average Flow', 'System Pressure', 'Vibration Load', 'Active Segments'].map((label, i) => (
                    <CeramicCard key={i} className="p-4 flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-medium">{label}</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">--</span>
                    </CeramicCard>
                ))}
            </div>
        </div>
    );
}
