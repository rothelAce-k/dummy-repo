import React, { useState } from 'react';
import { useSensor } from '../contexts/SensorContext';
import { CeramicCard } from '../components/ui/CeramicCard';
import { Compass, Ruler, Grip, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Blueprint() {
    const { sensors, segmentHealth, getSensorReading } = useSensor();
    const [selectedSensor, setSelectedSensor] = useState(null);

    // Schematic Constants
    const WIDTH = 1000;
    const HEIGHT = 400;
    const START_X = 100;
    const SPACING = 200;
    const PIPE_Y = HEIGHT / 2;

    const nodes = sensors.map((s, i) => ({
        ...s,
        x: START_X + (i * SPACING),
        y: PIPE_Y
    }));

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <Compass className="w-8 h-8 text-indigo-600" />
                        ENGINEERING_BLUEPRINT_V1
                    </h1>
                    <p className="text-slate-500 font-mono text-sm mt-1">SCHEMATIC VIEW // SENSOR TOPOLOGY MAP</p>
                </div>
                <div className="flex gap-4 font-mono text-xs text-slate-400">
                    <div className="flex items-center gap-2"><Ruler className="w-4 h-4" /> SCALE: 1:100</div>
                    <div className="flex items-center gap-2"><Grip className="w-4 h-4" /> GRID: ON</div>
                </div>
            </div>

            {/* BLUEPRINT VIEWPORT */}
            <div className="relative w-full h-[500px] border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-sm overflow-hidden shadow-sm flex">

                {/* BACKGROUND GRID */}
                <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* SVG LAYER */}
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-3/4 h-full border-r border-slate-200 dark:border-slate-800">
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                            markerWidth="6" markerHeight="6"
                            orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                        </marker>
                    </defs>

                    {/* --- PIPES --- */}
                    {nodes.slice(0, -1).map((node, i) => {
                        const nextNode = nodes[i + 1];
                        const segKey = `${node.id.split('_')[1]}-${nextNode.id.split('_')[1]}`;
                        const health = segmentHealth[segKey] || 100;
                        const isWarning = health < 90;
                        const color = isWarning ? '#f59e0b' : '#64748b'; // Amber or Slate

                        return (
                            <g key={`pipe-${i}`}>
                                {/* Pipe Upper Wall */}
                                <line x1={node.x} y1={PIPE_Y - 15} x2={nextNode.x} y2={PIPE_Y - 15} stroke={color} strokeWidth="2" />
                                {/* Pipe Lower Wall */}
                                <line x1={node.x} y1={PIPE_Y + 15} x2={nextNode.x} y2={PIPE_Y + 15} stroke={color} strokeWidth="2" />

                                {/* Flow Centerline (Animated) */}
                                <line x1={node.x} y1={PIPE_Y} x2={nextNode.x} y2={PIPE_Y}
                                    stroke={color} strokeWidth="1" strokeDasharray="5 5"
                                    className="animate-flow" // Define keyframes in global CSS or style tag
                                    style={{ animation: `flowDash ${isWarning ? '2s' : '1s'} linear infinite` }}
                                />

                                {/* Distance Marker */}
                                <text x={node.x + SPACING / 2} y={PIPE_Y + 40} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="monospace">
                                    SEG-{i + 1} [{health.toFixed(1)}%]
                                </text>
                            </g>
                        )
                    })}

                    {/* --- NODES --- */}
                    {nodes.map((node, i) => (
                        <g key={node.id}
                            onClick={() => setSelectedSensor(node)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {/* Sensor Outer */}
                            <circle cx={node.x} cy={node.y} r="12" fill="white" stroke="#0f172a" strokeWidth="2" />
                            {/* Sensor Inner */}
                            <circle cx={node.x} cy={node.y} r="4" fill={selectedSensor?.id === node.id ? '#3b82f6' : '#cbd5e1'} />

                            {/* Technical Label */}
                            <line x1={node.x} y1={PIPE_Y - 20} x2={node.x} y2={PIPE_Y - 50} stroke="#cbd5e1" strokeWidth="1" />
                            <text x={node.x} y={PIPE_Y - 60} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155" fontFamily="monospace">
                                {node.id}
                            </text>
                        </g>
                    ))}

                    {/* Inline Styles for Animation */}
                    <style>
                        {`
                            @keyframes flowDash {
                                to { stroke-dashoffset: -20; }
                            }
                        `}
                    </style>
                </svg>

                {/* RIGHT PANEL - SPECS */}
                <div className="w-1/4 h-full p-6 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                    <h3 className="text-sm font-mono font-bold text-slate-500 mb-4 border-b border-slate-200 pb-2">
                        COMPONENT_SPECS
                    </h3>

                    {selectedSensor ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <div className="text-xs text-slate-400 font-mono">SENSOR_ID</div>
                                <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{selectedSensor.id}</div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-400 font-mono mb-1">LIVE_TELEMETRY</div>
                                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-sm font-mono text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span>PRESSURE:</span>
                                        <span className="font-bold">{getSensorReading(selectedSensor.id).pressure.toFixed(2)} PSI</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>FLOW_RATE:</span>
                                        <span>{getSensorReading(selectedSensor.id).flow.toFixed(1)} L/m</span>
                                    </div>
                                    <div className={`flex justify-between ${getSensorReading(selectedSensor.id).vibration > 0.5 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                                        <span>VIBRATION:</span>
                                        <span>{getSensorReading(selectedSensor.id).vibration.toFixed(3)} G</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-400 font-mono mb-1">NOTES</div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Standard industrial piezoelectric sensor.
                                    Calibrated for high-pressure hydraulic lines.
                                    {selectedSensor.status !== 'normal' && <span className="block mt-2 text-amber-600 font-bold">WARNING: Abnormal readings detected. Inspect seal integrity.</span>}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
                            <FileText className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-xs font-mono">SELECT A NODE ON THE SCHEMATIC TO VIEW SPECS</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
