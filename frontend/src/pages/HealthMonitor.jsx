import React, { useState, useMemo } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { toast } from 'react-hot-toast'
import { CeramicCard } from '../components/ui/CeramicCard'
import {
    Activity, AlertTriangle, TrendingUp, TrendingDown,
    Shield, Droplets, Wind, Zap, ArrowRight, CheckCircle, Gauge
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

// INVESTIGATION COMPONENTS
import InvestigationPreview from '../components/investigation/InvestigationPreview';
import InvestigationReport from '../components/investigation/InvestigationReport';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { cn } from '../lib/utils'
import { useSensor } from '../contexts/SensorContext'

const SectorRow = ({ name, score, trend, active, onClick }) => (
    <div
        onClick={onClick}
        className={cn(
            "flex items-center justify-between py-3 px-3 rounded-lg transition-all cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0",
            active
                ? 'bg-indigo-50 border-l-4 border-l-indigo-500 dark:bg-indigo-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-l-transparent'
        )}
    >
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${score > 80 ? 'bg-emerald-500' : score > 60 ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <span className={cn("font-medium", active ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300')}>{name}</span>
        </div>
        <div className="flex items-center gap-4">
            <span className={`text-sm font-mono font-bold ${score > 80 ? 'text-emerald-600' : score > 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                {score.toFixed(2)}%
            </span>
            {trend === 'down' ? <TrendingDown size={14} className="text-rose-500" /> : <TrendingUp size={14} className="text-emerald-500" />}
        </div>
    </div>
)

// --- HELPER: SYSTEM BASELINE CURVE ---
// Generates a "wavy" baseline representing system-wide environmental factors (temp, load)
// that enables all segment graphs to look "relatable" (moving together).
const generateBaseline = (points) => {
    const baseline = [];
    let val = 100;
    for (let i = 0; i < points; i++) {
        // Sine wave + random wander
        const dayFactor = Math.sin(i * 0.5) * 0.2; // Correlated wobble
        val = 100 + dayFactor + (Math.random() * 0.05);
        baseline.push(Math.min(100, val));
    }
    return baseline.reverse(); // Newest first for UI mapping? careful with order
};

export default function HealthMonitor() {
    const [selectedSegment, setSelectedSegment] = useState('overall');
    // Switchable Time Window
    const [timeRange, setTimeRange] = useState('7d');

    const { segmentHealth, systemHealth, sensors, getSensorReading, isLive } = useSensor();



    // INVESTIGATION STATE
    const [showReport, setShowReport] = useState(false);

    const [hoveredSensor, setHoveredSensor] = useState(null);

    // Map segments to rich data
    const segmentData = useMemo(() => {
        const createSegmentData = (id, name, score) => {
            const isDegrading = id === 'C-D'; // Explicitly flagging logic for demo

            // SCENARIO SPECIFIC DRIVERS
            let drivers = [];
            let recommendation = {};

            if (id === 'C-D') {
                // The Leak Zone (CRITICAL)
                drivers = [
                    { name: 'Active Fluid Leak', severity: 'high', impact: '-12%', icon: Droplets },
                    { name: 'Corrosion Degradation', severity: 'high', impact: '-8%', icon: Shield },
                    { name: 'Pressure Diff', severity: 'medium', impact: '-5%', icon: Gauge },
                    { name: 'Vibration Spike', severity: 'medium', impact: '-2%', icon: Activity }
                ];
                recommendation = {
                    action: 'Initiate Emergency Isolation',
                    type: 'Critical',
                    priority: 'Immediate',
                    timeframe: 'NOW',
                    desc: 'Critical failure confirmed in Segment C-D. Automatic shutdown protocol recommended. Isolate Valves V-C/V-D immediately.',
                    button: { show: true, text: 'CREATE EMERGENCY WORK ORDER', variant: 'destructive' }
                };
            } else if (id === 'B-C' || id === 'D-E') {
                // Adjacent Zones (WARNING)
                drivers = [
                    { name: 'Pressure Wave', severity: 'medium', impact: '-2%', icon: Wind },
                    { name: 'Flow Instability', severity: 'low', impact: '-1%', icon: Activity }
                ];
                recommendation = {
                    action: 'Monitor Propagation',
                    type: 'Warning',
                    priority: 'High',
                    timeframe: '24 Hours',
                    desc: 'Abnormal pressure signatures detected from adjacent rupture. Verify sensor calibration and check for secondary stress.',
                    button: { show: true, text: 'Schedule Inspection', variant: 'warning' }
                };
            } else {
                // Healthy (NOMINAL)
                drivers = [{ name: 'System Noise', severity: 'low', impact: '0%', icon: Activity }];
                recommendation = {
                    action: 'System Nominal',
                    type: 'Good',
                    priority: 'Low',
                    timeframe: 'Routine',
                    desc: 'Segment operating within optimal performance parameters. No intervention required.',
                    button: { show: false }
                };
            }

            return {
                id,
                name,
                score: score,
                trend: isDegrading ? 'degrading' : 'stable',
                trendValue: isDegrading ? (timeRange === '7d' ? '-1.5%' : '-5.2%') : 'Stable',
                riskLevel: score > 95 ? 'Healthy' : score > 90 ? 'Monitor' : 'At Risk',
                drivers,
                recommendation
            };
        };

        return {
            'overall': createSegmentData('overall', 'Overall Network', systemHealth),
            'A-B': createSegmentData('A-B', 'Segment A -> B', segmentHealth['A-B']),
            'B-C': createSegmentData('B-C', 'Segment B -> C', segmentHealth['B-C']),
            'C-D': createSegmentData('C-D', 'Segment C -> D', segmentHealth['C-D']),
            'D-E': createSegmentData('D-E', 'Segment D -> E', segmentHealth['D-E']),
        };
    }, [segmentHealth, systemHealth, timeRange]);

    const data = segmentData[selectedSegment] || segmentData['overall'];

    // Visual Helpers
    const getStatusColor = (level) => {
        switch (level) {
            case 'Healthy': return { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-500' };
            case 'Monitor': return { text: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-500' };
            case 'At Risk': return { text: 'text-orange-600', bg: 'bg-orange-500', border: 'border-orange-500' };
            default: return { text: 'text-slate-600', bg: 'bg-slate-500', border: 'border-slate-500' };
        }
    }
    const colors = getStatusColor(data.riskLevel);

    // CORRELATED HISTORY GENERATION
    const historyData = useMemo(() => {
        const days = timeRange === '7d' ? 7 : 30;
        const pts = [];

        // 1. Generate System Baseline (The "Relatable" part)
        // We generate a curve that ALL segments essentially follow
        const baseline = generateBaseline(days);

        // 2. Apply Segment Specifics
        let currentScore = parseFloat(data.score); // End point (Today)

        // If degradation, we need to know slope
        // 7d = 0.2/day, 30d = 0.1/day avg
        const degradationRate = (selectedSegment === 'C-D') ? (timeRange === '7d' ? 0.2 : 0.1) : 0.0;

        // Reconstruct history backwards from current
        for (let i = 0; i < days; i++) {
            // i=0 is Today. i=6 is 6 days ago.
            // We use the baseline shape (reversed in list)
            // baseline[i] is just a shape factor ~100
            const shapeMod = baseline[i] - 100; // e.g. +0.2, -0.1

            // Expected value if linear
            const linearValue = currentScore + (i * degradationRate);

            // Combined: Linear trend + System Shape
            const val = linearValue + shapeMod;

            pts.unshift({
                day: i === 0 ? 'Today' : `-${i}d`,
                score: Math.min(100, Math.max(0, val)).toFixed(2)
            });
        }
        return pts;

    }, [data.score, selectedSegment, timeRange]);


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Health Monitoring</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time degradation analysis per pipeline segment</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Live Status Indicator */}
                    <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-slate-800">
                        <span className="relative flex h-2.5 w-2.5">
                            {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{isLive ? 'Live' : 'Paused'}</span>
                    </div>

                    <Select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="bg-transparent border-none text-slate-900 dark:text-white min-w-[200px] focus:ring-0 font-medium"
                    >
                        <option value="overall">Overall System</option>
                        <option value="A-B">Segment A &rarr; B</option>
                        <option value="B-C">Segment B &rarr; C</option>
                        <option value="C-D">Segment C &rarr; D (Critical)</option>
                        <option value="D-E">Segment D &rarr; E</option>
                    </Select>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                    <div className="flex items-center gap-1">
                        <Button
                            variant={timeRange === '7d' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setTimeRange('7d')}
                            className="text-xs"
                        >
                            7 Days
                        </Button>
                        <Button
                            variant={timeRange === '30d' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setTimeRange('30d')}
                            className="text-xs"
                        >
                            30 Days
                        </Button>
                    </div>
                </div>
            </div>

            {/* VTWIN SYSTEM OVERVIEW (Integrated) */}
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm overflow-x-auto">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">System Topology Health</h2>
                <div className="flex items-center justify-between min-w-[1000px] px-4">
                    {sensors && sensors.map((sensor, i) => {
                        const reading = getSensorReading(sensor.id);
                        const isWarning = sensor.status === 'warning';
                        const isCritical = sensor.status === 'critical';

                        // Connector Logic Inline
                        let connector = null;
                        if (i < sensors.length - 1) {
                            const nextSensor = sensors[i + 1];
                            const segKey = `${sensor.id.split('_')[1]}-${nextSensor.id.split('_')[1]}`;
                            const health = segmentHealth[segKey] || 100;
                            let colorClass = 'bg-blue-200 dark:bg-blue-900';
                            let statusColor = 'text-blue-500';
                            if (health < 90) { colorClass = 'bg-amber-200 dark:bg-amber-900'; statusColor = 'text-amber-500'; }
                            if (health < 75) { colorClass = 'bg-red-200 dark:bg-red-900'; statusColor = 'text-red-500'; }

                            // Interactive Connector (Clickable, Hover Tooltip)
                            connector = (
                                <div
                                    className="flex-1 h-32 flex flex-col items-center justify-center relative min-w-[100px] group cursor-pointer"
                                    onClick={() => {
                                        setSelectedSegment(segKey);
                                        toast.success(`Switched to Segment ${segKey}`);
                                    }}
                                >
                                    {/* Tooltip on Hover */}
                                    <div className="absolute -top-8 px-2 py-1 bg-slate-800 text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        SEGMENT {segKey}
                                    </div>

                                    {/* Dashed Line - Thicker on Hover */}
                                    <div className={`w-full border-t-2 group-hover:border-t-4 transition-all duration-200 border-dashed ${health < 90 ? 'border-amber-500' : 'border-slate-300 dark:border-slate-600'} relative`}>
                                    </div>

                                    {/* Efficiency Label */}
                                    <div className={`absolute -top-3 px-1 bg-white dark:bg-slate-900 text-[10px] font-mono ${statusColor} group-hover:font-bold`}>
                                        EFF:{health.toFixed(0)}%
                                    </div>

                                    {/* Arrow Icon - Larger & Bolder */}
                                    <div className={`absolute bottom-10 ${statusColor} group-hover:scale-125 transition-transform duration-200`}>
                                        <ArrowRight className="w-5 h-5 stroke-2" />
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <React.Fragment key={sensor.id}>
                                <div className="relative z-10">
                                    {/* WIREFRAME CARD: Transparent, Monospace, Technical */}
                                    <div
                                        className={`w-48 p-3 border-2 transition-all duration-300 font-mono relative bg-white/50 dark:bg-slate-900/50 ${isCritical ? 'border-red-600 border-double' :
                                            isWarning ? 'border-amber-500 border-dashed' :
                                                'border-slate-400 dark:border-slate-600'
                                            }`}
                                        onMouseEnter={() => setHoveredSensor(sensor.id)}
                                        onMouseLeave={() => setHoveredSensor(null)}
                                    >
                                        {/* HOVER POPUP - WARNING or STATUS */}
                                        {(hoveredSensor === sensor.id) && (
                                            <div className="absolute -top-24 left-0 right-0 z-20 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200">
                                                <div className={`p-2 shadow-xl border-2 text-xs font-bold font-mono text-center
                                                    ${isCritical ? 'bg-red-600 text-white border-red-800' :
                                                        isWarning ? 'bg-amber-400 text-amber-900 border-amber-600' :
                                                            'bg-blue-500 text-white border-blue-700'}
                                                `}>
                                                    <div className="flex items-center justify-center gap-1 mb-1 border-b border-black/10 pb-1">
                                                        {isCritical || isWarning ? <AlertTriangle className="w-3 h-3 fill-current" /> : <Activity className="w-3 h-3" />}
                                                        <span>{isCritical || isWarning ? 'SIGNAL DETECTED' : 'SYSTEM STATUS'}</span>
                                                    </div>

                                                    {isCritical || isWarning ? (
                                                        <div className="bg-black/10 p-1">
                                                            {sensor.id === 'SENSOR_C' || sensor.id === 'SENSOR_D' ? 'WARNING MEDIUM LEAK DETECTED' : 'ANOMALY DETECTED'}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1 text-[9px] text-left px-1">
                                                            <div className="flex justify-between"><span>FLOW:</span><span>{reading.flow.toFixed(1)} L/m</span></div>
                                                            <div className="flex justify-between"><span>TEMP:</span><span>{reading.temp.toFixed(1)}°C</span></div>
                                                            <div className="flex justify-between"><span>EFF:</span><span>100%</span></div>
                                                        </div>
                                                    )}

                                                    {/* Little arrow down */}
                                                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]
                                                        ${isCritical ? 'border-t-red-800' : isWarning ? 'border-t-amber-600' : 'border-t-blue-700'}
                                                    `} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 border-dashed">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase">{sensor.name}</span>
                                            {isCritical ? (
                                                <AlertTriangle
                                                    className="w-4 h-4 text-red-600 cursor-pointer animate-pulse"
                                                    onClick={() => toast.error("CRITICAL ALERT", { duration: 4000 })}
                                                />
                                            ) : isWarning ? (
                                                <AlertTriangle
                                                    className="w-4 h-4 text-amber-600 cursor-pointer animate-pulse"
                                                    onClick={() => sensor.id === 'SENSOR_D' || sensor.id === 'SENSOR_C'
                                                        ? toast("Warning - multiple medium leak signatures detected", { icon: '⚠️', duration: 4000, style: { background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' } })
                                                        : toast.error("Warning - Anomaly Detected")
                                                    }
                                                />
                                            ) : (
                                                <div className="text-[10px] text-slate-400 font-bold">[OK]</div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[10px] text-slate-500 uppercase">P_IN:</span>
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                                                    {reading.pressure.toFixed(1)} <span className="text-[8px] text-slate-400">PSI</span>
                                                </span>
                                            </div>
                                            {/* Retro Text Bar */}
                                            <div className="text-[8px] tracking-tighter text-slate-300 dark:text-slate-700 overflow-hidden whitespace-nowrap">
                                                <span className={isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-500'}>
                                                    {'|'.repeat(Math.min(20, Math.floor(reading.pressure / 5)))}
                                                </span>
                                                <span className="opacity-20">{'|'.repeat(Math.max(0, 20 - Math.floor(reading.pressure / 5)))}</span>
                                            </div>

                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-[10px] text-slate-500 uppercase">VIB:</span>
                                                <span className={`text-[10px] ${reading.vibration > 0.5 ? 'text-amber-600 font-bold bg-amber-100 dark:bg-amber-900/30 px-1' : 'text-slate-500'}`}>
                                                    {reading.vibration.toFixed(3)}G
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                            [{sensor.location.split(' ')[2] || 'LOC'}]
                                        </span>
                                    </div>
                                </div>
                                {connector}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* ZONE A: THE VERDICT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Health Gauge Card */}
                <div className="arch-card md:col-span-4 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6 w-full text-left">{data.name} Health</h3>
                    <div className="relative w-56 h-56 flex items-center justify-center">
                        {/* SVG Gauge Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background Track */}
                            <circle cx="112" cy="112" r="96" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="16" fill="transparent" />
                            {/* Value Path */}
                            <circle
                                cx="112" cy="112" r="96"
                                stroke="currentColor"
                                className={colors.text}
                                strokeWidth="16"
                                strokeLinecap="round"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 96}
                                strokeDashoffset={2 * Math.PI * 96 * (1 - data.score / 100)}
                                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-5xl font-bold ${colors.text} tracking-tighter`}>{parseFloat(data.score).toFixed(1)}</span>
                            <span className="text-sm text-slate-400 mt-1 uppercase font-semibold">/ 100</span>
                        </div>
                    </div>

                    <div className="w-full mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="text-center border-r border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-500 uppercase mb-1">Risk Category</p>
                            <Badge className={`${colors.bg}/10 ${colors.text} border-0 px-3 py-1 text-sm font-bold`}>
                                {data.riskLevel.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 uppercase mb-1">Trend Indicator</p>
                            <div className={`flex items-center justify-center gap-1 font-bold ${data.trend === 'improving' ? 'text-emerald-600' :
                                data.trend === 'stable' ? 'text-blue-500' : 'text-rose-600'
                                }`}>
                                {data.trend === 'improving' ? <TrendingUp size={16} /> :
                                    data.trend === 'stable' ? <Activity size={16} /> : <TrendingDown size={16} />}
                                <span className="capitalize">{data.trend}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ZONE B: TREND CHART */}
                <div className="arch-card md:col-span-8 flex flex-col p-6 bg-white dark:bg-slate-900">
                    <div className="flex flex-row items-center justify-between pb-2 mb-4">
                        <div className="space-y-1">
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Health Trend Analysis</h3>
                            <p className="text-sm text-slate-500">Real-time degradation monitoring (30 min window)</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium">
                            <Shield size={12} />
                            Confidence: High (98%)
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={data.trend === 'degrading' ? '#d97706' : '#059669'} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={data.trend === 'degrading' ? '#d97706' : '#059669'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[80, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke={data.trend === 'degrading' ? '#d97706' : '#059669'}
                                    strokeWidth={3}
                                    fill="url(#scoreGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ZONE C: ACTION & CONTEXT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* DEGRADATION DRIVERS */}
                <div className="arch-card p-6 bg-white dark:bg-slate-900">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Top Degradation Drivers</h3>
                    <div className="space-y-4">
                        {data.drivers.map((driver, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <div className={`p-2 rounded ${driver.severity === 'high' ? 'bg-rose-100 text-rose-600' : driver.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <driver.icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{driver.name}</h4>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                                        <div
                                            className={`h-1.5 rounded-full ${driver.severity === 'high' ? 'bg-rose-500' : driver.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                            style={{ width: driver.severity === 'high' ? '85%' : driver.severity === 'medium' ? '60%' : '30%' }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-500">{driver.impact}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RECOMMENDATION PANEL (ACTIONABLE) */}
                {/* RECOMMENDATION PANEL (ACTIONABLE) */}
                <div className={`arch-card p-6 border-l-4 ${data.recommendation.type === 'Critical' ? 'border-rose-500' : data.recommendation.type === 'Warning' ? 'border-amber-500' : 'border-emerald-500'} flex flex-col justify-between bg-white dark:bg-slate-900`}>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {data.recommendation.type === 'Critical' ? <AlertTriangle className="text-rose-500 animate-pulse" /> :
                                data.recommendation.type === 'Warning' ? <AlertTriangle className="text-amber-500" /> :
                                    <Shield className="text-emerald-500" />}
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                {data.recommendation.type === 'Good' ? 'System Status' : 'Recommended Action'}
                            </h4>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{data.recommendation.action}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">{data.recommendation.desc}</p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Priority</span>
                                <span className={`text-sm font-bold ${data.recommendation.priority === 'Immediate' ? 'text-rose-600' : data.recommendation.priority === 'High' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {data.recommendation.priority.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Timeframe</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-white">{data.recommendation.timeframe}</span>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Action Button */}
                    {data.recommendation.button.show && (
                        <Button
                            className={`w-full mt-6 text-white border-0 font-bold shadow-md transition-all
                                ${data.recommendation.button.variant === 'destructive' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-rose-900/20' :
                                    data.recommendation.button.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-amber-900/20' :
                                        'bg-slate-800'}`}
                            onClick={() => toast.success("Work Order Created: WO-2026-X89")}
                        >
                            {data.recommendation.button.text}
                        </Button>
                    )}
                </div>

                <div className="flex flex-col h-full">
                    <div className="arch-card p-6 flex flex-col bg-white dark:bg-slate-900 h-full">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Segments</h3>
                        <div className="space-y-1">
                            <SectorRow
                                name="Overall"
                                score={segmentData['overall'].score}
                                trend="stable"
                                active={selectedSegment === 'overall'}
                                onClick={() => setSelectedSegment('overall')}
                            />
                            <SectorRow
                                name="Segment A->B"
                                score={segmentData['A-B'].score}
                                trend="stable"
                                active={selectedSegment === 'A-B'}
                                onClick={() => setSelectedSegment('A-B')}
                            />
                            <SectorRow
                                name="Segment B->C"
                                score={segmentData['B-C'].score}
                                trend="stable"
                                active={selectedSegment === 'B-C'}
                                onClick={() => setSelectedSegment('B-C')}
                            />
                            <SectorRow
                                name="Segment C->D"
                                score={segmentData['C-D'].score}
                                trend="down"
                                active={selectedSegment === 'C-D'}
                                onClick={() => setSelectedSegment('C-D')}
                            />
                            <SectorRow
                                name="Segment D->E"
                                score={segmentData['D-E'].score}
                                trend="stable"
                                active={selectedSegment === 'D-E'}
                                onClick={() => setSelectedSegment('D-E')}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* ZONE D: FULL WIDTH INVESTIGATION PANEL (If Critical) */}
            <AnimatePresence>
                {selectedSegment === 'C-D' && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 40, damping: 15 }}
                        className="w-full"
                    >
                        <InvestigationPreview
                            reliability={98.4}
                            onViewReport={() => setShowReport(true)}
                            className="w-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INVESTIGATION REPORT MODAL (Overlay) */}
            <InvestigationReport
                segmentId={selectedSegment}
                isOpen={showReport}
                onClose={() => setShowReport(false)}
            />
        </div >
    )
}
