import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import {
    Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
    Calendar, Shield, FileText, Download, ChevronRight, Droplets, Wind, Zap
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

// --- 1. PHYSICAL SCENARIO ENGINE ---
const ZONES_DB = {
    'overall': {
        name: 'Overall System',
        score: 72,
        trend: 'degrading',
        trendValue: '-4.2%',
        riskLevel: 'At Risk',
        drivers: [
            { name: 'Corrosion Progression', severity: 'high', impact: '-15%', icon: Droplets },
            { name: 'Flow Resistance', severity: 'medium', impact: '-8%', icon: Wind },
            { name: 'Vibration Instability', severity: 'low', impact: '-3%', icon: Activity }
        ],
        recommendation: {
            action: 'Schedule System Flush',
            type: 'Corrective',
            priority: 'High',
            timeframe: 'Next 5 Days',
            desc: 'Aggregated data suggests widespread flow resistance accumulating in Zone 2 and Safety Valve E.'
        }
    },
    'zone1': {
        name: 'Zone 1 (Main Pump)',
        score: 88,
        trend: 'stable',
        trendValue: '+0.5%',
        riskLevel: 'Monitor',
        drivers: [
            { name: 'Minor Cavitation', severity: 'low', impact: '-2%', icon: Activity },
            { name: 'Thermal Variance', severity: 'low', impact: '-1%', icon: Zap }
        ],
        recommendation: {
            action: 'Routine Pump Calibration',
            type: 'Preventive',
            priority: 'Low',
            timeframe: 'Next 30 Days',
            desc: 'Pump efficiency is optimal. Scheduled calibration is due next month.'
        }
    },
    'zone2': {
        name: 'Zone 2 (Valves)',
        score: 64,
        trend: 'degrading',
        trendValue: '-6.5%',
        riskLevel: 'At Risk',
        drivers: [
            { name: 'Flow Resistance', severity: 'high', impact: '-12%', icon: Wind },
            { name: 'Valve Sticking', severity: 'medium', impact: '-8%', icon: AlertTriangle },
            { name: 'Pressure Spikes', severity: 'low', impact: '-4%', icon: TrendingUp }
        ],
        recommendation: {
            action: 'Inspect Valve Seals',
            type: 'Corrective',
            priority: 'High',
            timeframe: 'Next 48 Hours',
            desc: 'Flow resistance pattern indicates potential valve seal degradation or obstruction.'
        }
    },
    'zone3': {
        name: 'Zone 3 (Flow)',
        score: 94,
        trend: 'improving',
        trendValue: '+1.2%',
        riskLevel: 'Healthy',
        drivers: [
            { name: 'System Noise', severity: 'low', impact: '< 0.5%', icon: Activity }
        ],
        recommendation: {
            action: 'No Action Required',
            type: 'None',
            priority: 'Low',
            timeframe: 'N/A',
            desc: 'Flow parameters are performing above baseline efficiency.'
        }
    },
    'safety_valve': {
        name: 'Safety Valve E',
        score: 45,
        trend: 'critical',
        trendValue: '-12%',
        riskLevel: 'Maintenance Required',
        drivers: [
            { name: 'Severe Corrosion', severity: 'high', impact: '-25%', icon: Droplets },
            { name: 'Material Fatigue', severity: 'high', impact: '-15%', icon: AlertTriangle },
            { name: 'Leakage Probability', severity: 'medium', impact: '-10%', icon: Droplets }
        ],
        recommendation: {
            action: 'Emergency Replacement',
            type: 'Critical',
            priority: 'Critical',
            timeframe: 'IMMEDIATE',
            desc: 'Corrosion indicators have breached safety thresholds. structural integrity is compromised.'
        }
    }
}

// --- 2. HOOK: SIMULATION LOGIC ---
const useHealthSimulation = (selectedZone, timeRange) => {
    // Get valid zone data or fallback
    const data = ZONES_DB[selectedZone] || ZONES_DB['overall'];

    // Derived Visual Properties
    const getStatusColor = (level) => {
        switch (level) {
            case 'Healthy': return { text: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500' };
            case 'Monitor': return { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500' };
            case 'At Risk': return { text: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500' };
            case 'Maintenance Required': return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500' };
            default: return { text: 'text-gray-500', bg: 'bg-gray-500', border: 'border-gray-500' };
        }
    }
    const colors = getStatusColor(data.riskLevel);

    // Generate Context-Aware History
    // If range is 7d, we show 7 points. 30d = 30 points.
    // The curve shape depends on the current score and trend.
    const historyPoints = timeRange === '7d' ? 7 : 30;
    const historyData = [];

    let currentScore = data.score;
    // We work backwards from current score
    for (let i = 0; i < historyPoints; i++) {
        // Trend factor: if degrading, past was higher. if improving, past was lower.
        let trendFactor = 0;
        if (data.trend === 'degrading' || data.trend === 'critical') trendFactor = 0.5; // Past was +0.5 per day higher
        if (data.trend === 'improving') trendFactor = -0.2; // Past was lower

        // Add volatility based on risk (lower score = higher volatility)
        const volatility = (100 - data.score) / 200;
        const noise = (Math.random() - 0.5) * (volatility * 10);

        const pointScore = currentScore + (trendFactor * i) + noise;

        historyData.unshift({
            day: i === 0 ? 'Today' : `-${i}d`,
            score: Math.min(100, Math.max(0, pointScore)).toFixed(1)
        });
    }

    return {
        data,
        colors,
        historyData
    };
}

const SectorRow = ({ name, score, trend, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between py-3 border-b border-gray-800 last:border-0 px-3 rounded transition-all cursor-pointer 
        ${active ? 'bg-white/10 border-l-4 border-l-blue-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${score > 80 ? 'bg-green-500' : score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className={`font-medium ${active ? 'text-white' : 'text-gray-300'}`}>{name}</span>
        </div>
        <div className="flex items-center gap-4">
            <span className={`text-sm font-mono ${score > 80 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}%
            </span>
            {trend === 'down' ? <TrendingDown size={14} className="text-red-400" /> : <TrendingUp size={14} className="text-green-400" />}
        </div>
    </div>
)

export default function HealthMonitor() {
    const [selectedZone, setSelectedZone] = useState('overall');
    const [timeRange, setTimeRange] = useState('30d');

    const { data, colors, historyData } = useHealthSimulation(selectedZone, timeRange);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Health Monitoring</h1>
                    <p className="text-gray-400 mt-1">Operational readiness and predictive maintenance</p>
                </div>

                <div className="flex items-center gap-3 bg-background-secondary p-1 rounded-xl border border-gray-800">
                    <Select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="bg-background-tertiary border-gray-700 text-white min-w-[200px]"
                    >
                        <option value="overall">Overall System</option>
                        <option value="zone1">Zone 1 (Main Pump)</option>
                        <option value="zone2">Zone 2 (Valves)</option>
                        <option value="zone3">Zone 3 (Flow)</option>
                        <option value="safety_valve">Safety Valve E</option>
                    </Select>

                    <div className="h-6 w-px bg-gray-700 mx-2" />

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

            {/* ZONE A: THE VERDICT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Health Gauge Card */}
                <Card className="md:col-span-4 bg-gradient-to-br from-background-secondary to-background-secondary/50 border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-400 text-sm font-medium uppercase tracking-wider">{data.name} Health</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            {/* SVG Gauge Ring */}
                            <svg className="w-full h-full transform -rotate-90">
                                {/* Background Track */}
                                <circle cx="112" cy="112" r="96" stroke="#1f2937" strokeWidth="16" fill="transparent" />
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
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-6xl font-bold ${colors.text} tracking-tighter`}>{data.score}</span>
                                <span className="text-sm text-gray-500 mt-1 uppercase font-semibold">/ 100</span>
                            </div>
                        </div>

                        <div className="w-full mt-6 grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                            <div className="text-center border-r border-gray-800">
                                <p className="text-xs text-gray-400 uppercase mb-1">Risk Category</p>
                                <Badge className={`${colors.bg}/10 ${colors.text} border-0 px-3 py-1 text-sm font-bold`}>
                                    {data.riskLevel.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase mb-1">Trend Indicator</p>
                                <div className={`flex items-center justify-center gap-1 font-bold ${data.trend === 'improving' ? 'text-green-500' :
                                        data.trend === 'stable' ? 'text-blue-400' : 'text-red-500'
                                    }`}>
                                    {data.trend === 'improving' ? <TrendingUp size={16} /> :
                                        data.trend === 'stable' ? <Activity size={16} /> : <TrendingDown size={16} />}
                                    <span className="capitalize">{data.trend} ({data.trendValue})</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ZONE B: TREND CHART */}
                <Card className="md:col-span-8 border-gray-800 bg-background-secondary/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-gray-400 text-sm font-medium uppercase tracking-wider">Health Trend Analysis ({timeRange})</CardTitle>
                            <CardDescription>Historical performance based on predictive modeling</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-background-tertiary rounded text-xs text-gray-400">
                            <Shield size={12} className="text-emerald-400" />
                            Confidence: High (98%)
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historyData}>
                                    <defs>
                                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={data.score > 80 ? '#22c55e' : data.score > 60 ? '#eab308' : '#ef4444'} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={data.score > 80 ? '#22c55e' : data.score > 60 ? '#eab308' : '#ef4444'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} hide />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <ReferenceLine y={75} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Warning Threshold', fill: '#eab308', fontSize: 10 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke={data.score > 80 ? '#22c55e' : data.score > 60 ? '#eab308' : '#ef4444'}
                                        fillOpacity={1}
                                        fill="url(#colorHealth)"
                                        strokeWidth={3}
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ZONE C: ACTION & CONTEXT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* DEGRADATION DRIVERS (PHYSICS RELEVANT) */}
                <Card className="border-gray-800 bg-background-secondary/30">
                    <CardHeader>
                        <CardTitle className="text-gray-400 text-sm font-medium uppercase tracking-wider">Top Degradation Drivers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.drivers.map((driver, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background-tertiary border border-gray-800/50">
                                <div className={`p-2 rounded ${driver.severity === 'high' ? 'bg-red-500/10 text-red-500' : driver.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    <driver.icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-white">{driver.name}</h4>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
                                        <div
                                            className={`h-1.5 rounded-full ${driver.severity === 'high' ? 'bg-red-500' : driver.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}
                                            style={{ width: driver.severity === 'high' ? '85%' : driver.severity === 'medium' ? '60%' : '30%' }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-gray-400">{driver.impact}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* RECOMMENDATION PANEL (ACTIONABLE) */}
                <Card className={`border-l-4 ${colors.border} border-gray-800 bg-gradient-to-br from-background-secondary to-transparent`}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            {data.priority === 'Critical' ? <AlertTriangle className="text-red-500" /> : <Shield className="text-blue-500" />}
                            <CardTitle className={`${colors.text} text-sm font-bold uppercase tracking-wider`}>Recommended Action</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{data.recommendation.action}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{data.recommendation.desc}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                            <div>
                                <span className="text-xs text-gray-500 block uppercase tracking-wider">Priority</span>
                                <span className={`text-sm font-bold ${data.recommendation.priority === 'High' || data.recommendation.priority === 'Critical' ? 'text-red-400' : 'text-white'}`}>
                                    {data.recommendation.priority.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block uppercase tracking-wider">Timeframe</span>
                                <span className="text-sm font-bold text-white">{data.recommendation.timeframe}</span>
                            </div>
                        </div>

                        <Button className={`w-full mt-2 ${colors.bg} hover:opacity-90 text-white border-0 font-bold transition-all`}>
                            {data.recommendation.type === 'Preventive' ? 'Schedule Maintenance' : 'Create Work Order'}
                        </Button>
                    </CardContent>
                </Card>

                {/* SECTOR RISK LIST (SWITCHER) */}
                <Card className="border-gray-800 bg-background-secondary/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-gray-400 text-sm font-medium uppercase tracking-wider">Sector Risk Ranking</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-1">
                            <SectorRow
                                name="Overall System"
                                score={72}
                                trend="down"
                                active={selectedZone === 'overall'}
                                onClick={() => setSelectedZone('overall')}
                            />
                            <SectorRow
                                name="Safety Valve E"
                                score={45}
                                trend="down"
                                active={selectedZone === 'safety_valve'}
                                onClick={() => setSelectedZone('safety_valve')}
                            />
                            <SectorRow
                                name="Zone 2 (Valves)"
                                score={64}
                                trend="down"
                                active={selectedZone === 'zone2'}
                                onClick={() => setSelectedZone('zone2')}
                            />
                            <SectorRow
                                name="Zone 1 (Main Pump)"
                                score={88}
                                trend="stable"
                                active={selectedZone === 'zone1'}
                                onClick={() => setSelectedZone('zone1')}
                            />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                            <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 w-full">
                                View Full Asset List <ChevronRight size={12} className="ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
