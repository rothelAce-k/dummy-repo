import React from 'react';
import { useSensor } from '../contexts/SensorContext';
import { CeramicCard } from '../components/ui/CeramicCard';

export default function DashboardC() {
    const { sensors, systemHealth, getSensorReading } = useSensor();

    // Radial Calculations
    const RADIUS = 250;
    const CENTER_X = 400;
    const CENTER_Y = 300;

    return (
        <div className="min-h-[calc(100vh-4rem)] p-8 animate-in fade-in duration-500 flex flex-col items-center">
            <div className="w-full max-w-4xl mb-4 text-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Hub</h1>
                <p className="text-slate-500">Radial Health Monitor</p>
            </div>

            <div className="relative w-[800px] h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Center Hub */}
                <div
                    className="absolute rounded-full bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border-4 border-slate-100 dark:border-slate-700 shadow-inner"
                    style={{
                        width: 160, height: 160,
                        left: CENTER_X - 80, top: CENTER_Y - 80,
                        zIndex: 20
                    }}
                >
                    <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">Health</span>
                    <span className={`text-4xl font-bold ${systemHealth > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {systemHealth.toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400 mt-2">Overall Status</span>
                </div>

                {/* Spoke Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {sensors.map((sensor, i) => {
                        const angle = (i * (360 / sensors.length)) - 90; // Start top
                        const rad = angle * (Math.PI / 180);
                        const x = CENTER_X + RADIUS * Math.cos(rad);
                        const y = CENTER_Y + RADIUS * Math.sin(rad);

                        return (
                            <line
                                key={i}
                                x1={CENTER_X} y1={CENTER_Y}
                                x2={x} y2={y}
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {sensors.map((sensor, i) => {
                    const angle = (i * (360 / sensors.length)) - 90;
                    const rad = angle * (Math.PI / 180);
                    const x = CENTER_X + RADIUS * Math.cos(rad);
                    const y = CENTER_Y + RADIUS * Math.sin(rad);

                    const reading = getSensorReading(sensor.id);
                    const isWarning = sensor.status === 'warning';

                    return (
                        <div
                            key={sensor.id}
                            className={`absolute w-32 -translate-x-1/2 -translate-y-1/2 p-3 text-center rounded-xl border-2 shadow-lg bg-white dark:bg-slate-900 z-30 transition-all hover:scale-110 ${isWarning ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'
                                }`}
                            style={{ left: x, top: y }}
                        >
                            <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">{sensor.name}</div>
                            <div className="text-xs text-slate-400 mb-2">{sensor.status}</div>
                            <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                {reading.pressure.toFixed(1)} <span className="text-[10px] text-slate-400">PSI</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
