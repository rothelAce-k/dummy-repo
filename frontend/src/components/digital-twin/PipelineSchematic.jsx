import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensor } from '../../contexts/SensorContext';
import HoloTag from './HoloTag';

const PipelineSchematic = ({ focusedSensor, setFocusedSensor }) => {
    const { sensors, segmentHealth, getSensorReading } = useSensor();

    // SVG Dimensions
    const WIDTH = 1200;
    const HEIGHT = 400;
    const PIPE_Y = HEIGHT / 2;
    const SENSOR_SPACING = 200;
    const START_X = 200; // Start with some padding

    // Generate Nodes based on sensors
    const nodes = sensors.map((sensor, i) => ({
        ...sensor,
        x: START_X + (i * SENSOR_SPACING),
        y: PIPE_Y
    }));

    // Helper to get color for health
    const getSegmentColor = (uId, downId) => {
        const key = `${uId.split('_')[1]}-${downId.split('_')[1]}`; // 'A-B'
        const score = segmentHealth[key] || 100;

        if (score < 90) return '#f59e0b'; // Amber (Warning)
        if (score < 75) return '#ef4444'; // Red (Critical)
        return '#3b82f6'; // Blue (Normal)
    };

    const getSegmentOpacity = (uId, downId) => {
        const key = `${uId.split('_')[1]}-${downId.split('_')[1]}`;
        const score = segmentHealth[key] || 100;
        return score < 95 ? 0.8 : 0.3; // Make healthy pipes clearer (glass), unhealthy frosted
    };

    return (
        <div className="w-full h-full relative overflow-visible">
            {/* Interactive SVG Layer */}
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.1))' }}
            >
                <defs>
                    <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <style>
                        {`
                            @keyframes flowLeft {
                                from { stroke-dashoffset: 0; }
                                to { stroke-dashoffset: -300; }
                            }
                        `}
                    </style>
                </defs>

                {/* --- PIPES (Segments) --- */}
                {nodes.slice(0, -1).map((node, i) => {
                    const nextNode = nodes[i + 1];
                    const color = getSegmentColor(node.id, nextNode.id);
                    const opacity = getSegmentOpacity(node.id, nextNode.id);

                    return (
                        <g key={`pipe-${i}`}>
                            {/* Glass Shell */}
                            <motion.rect
                                x={node.x} y={PIPE_Y - 20}
                                width={SENSOR_SPACING} height={40}
                                fill="url(#glassGradient)"
                                stroke={color}
                                strokeWidth="1"
                                rx="0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                            />

                            {/* Subtly Glassy Liquid Core */}
                            <motion.line
                                x1={node.x} y1={PIPE_Y}
                                x2={nextNode.x} y2={PIPE_Y}
                                stroke={color}
                                strokeWidth="16"
                                strokeLinecap="butt"
                                strokeOpacity="0.15"
                            />

                            {/* Illuminating Dotted Data Stream */}
                            {/* Illuminating Dotted Data Stream (CSS Animation) */}
                            <line
                                x1={node.x} y1={PIPE_Y}
                                x2={nextNode.x} y2={PIPE_Y}
                                stroke="white"
                                strokeWidth="4"
                                strokeDasharray="0 15"
                                strokeLinecap="round"
                                strokeOpacity={0.9}
                                style={{
                                    filter: `drop-shadow(0 0 8px ${color})`,
                                    animation: `flowLeft ${color === '#f59e0b' ? '3s' : '1s'} linear infinite`
                                }}
                            />

                            {/* Segment Health Label */}
                            <g>
                                <motion.rect
                                    x={node.x + SENSOR_SPACING / 2 - 25}
                                    y={PIPE_Y - 45}
                                    width="50" height="20"
                                    rx="4"
                                    fill="rgba(15, 23, 42, 0.8)"
                                    stroke={color}
                                    strokeWidth="1"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                />
                                <text
                                    x={node.x + SENSOR_SPACING / 2}
                                    y={PIPE_Y - 31}
                                    textAnchor="middle"
                                    fill={color}
                                    fontSize="11"
                                    fontWeight="bold"
                                    style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}
                                >
                                    {(segmentHealth[`${node.id.split('_')[1]}-${nextNode.id.split('_')[1]}`] || 100).toFixed(1)}%
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* --- NODES (Sensors) --- */}
                {nodes.map((node, i) => {
                    const isFocused = focusedSensor === node.id;
                    const reading = getSensorReading(node.id);

                    return (
                        <motion.g
                            key={node.id}
                            onClick={() => setFocusedSensor(isFocused ? null : node.id)}
                            className="cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Outer Glow Ring */}
                            <circle cx={node.x} cy={node.y} r="25" fill="none" stroke={isFocused ? '#fff' : '#3b82f6'} strokeWidth="2" opacity="0.5">
                                <animate attributeName="r" values="25;28;25" dur="3s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
                            </circle>

                            {/* Solid Core */}
                            <circle cx={node.x} cy={node.y} r="15" fill="#1e293b" stroke="#fff" strokeWidth="2" filter="url(#glow)" />

                            {/* Inner Dot Status */}
                            <circle cx={node.x} cy={node.y} r="6"
                                fill={node.status === 'normal' ? '#10b981' : node.status === 'warning' ? '#f59e0b' : '#ef4444'}
                            />

                            {/* Label */}
                            <text x={node.x} y={node.y + 45} textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">
                                {node.name}
                            </text>
                        </motion.g>
                    );
                })}


            </svg>

            {/* --- HOLO TAGS (HTML Overlay) --- */}
            <AnimatePresence>
                {nodes.map((node, i) => {
                    // Only show if focused OR hovered (simulated with CSS group logic or State logic)
                    // For now, let's show ALL on hover or ONE if focused.
                    if (focusedSensor && focusedSensor !== node.id) return null;
                    if (!focusedSensor) return null; // Only show on click (Smart Focus) for now to avoid clutter, or add Hover state in future

                    const reading = getSensorReading(node.id);
                    // Calculate Screen Position roughly (Need to be careful with SVG scaling)
                    // For simplicity in this demo, we assume relatively direct mapping or use centered offset
                    // In a real app, use getBoundingClientRect or map SVG coords to %

                    const leftPos = `calc(50% - ${((WIDTH / 2 - node.x) / WIDTH) * 100}%)`; // Centered logic approximation
                    // Actually simpler: 
                    // SVG is w-full.
                    // node.x is inside 1200 width.
                    // left = (node.x / 1200) * 100%

                    return (
                        <div key={`holo-${node.id}`} style={{ position: 'absolute', top: '35%', left: `${(node.x / WIDTH) * 100}%` }}>
                            <HoloTag
                                sensor={node}
                                reading={reading}
                                x={20} y={-100} // Offset from the node center
                            />
                        </div>
                    )
                })}
            </AnimatePresence>
        </div>
    );
};

export default PipelineSchematic;
