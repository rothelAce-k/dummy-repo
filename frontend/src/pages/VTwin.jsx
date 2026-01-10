import React from 'react';
import { useSensor } from '../contexts/SensorContext';
import { CeramicCard } from '../components/ui/CeramicCard';
import { Activity, ArrowRight, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export default function VTwin() {
    const { sensors, segmentHealth, getSensorReading } = useSensor();

    // Helper to get connectors
    const renderConnector = (sensor, index) => {
        if (index === sensors.length - 1) return null; // No connector after last node

        const nextSensor = sensors[index + 1];
        const segKey = `${sensor.id.split('_')[1]}-${nextSensor.id.split('_')[1]}`;
        const health = segmentHealth[segKey] || 100;

        let colorClass = 'bg-blue-200 dark:bg-blue-900';
        let statusColor = 'text-blue-500';

        if (health < 90) {
            colorClass = 'bg-amber-200 dark:bg-amber-900';
            statusColor = 'text-amber-500';
        }
        if (health < 75) {
            colorClass = 'bg-red-200 dark:bg-red-900';
            statusColor = 'text-red-500';
        }

        return (
            <div className="flex-1 h-32 flex flex-col items-center justify-center relative min-w-[100px]">
                {/* Pipe Line */}
                <div className={`w-full h-3 ${colorClass} rounded-full relative overflow-hidden`}>
                    {/* Simple CSS Flow Animation */}
                    <div className="absolute inset-0 opacity-30 animate-pulse bg-white/50 w-full h-full"
                        style={{ animationDuration: health < 90 ? '3s' : '1.5s' }}
                    />
                </div>

                {/* Segment Label */}
                <div className={`absolute -top-2 px-2 py-1 rounded bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-xs font-bold ${statusColor}`}>
                    {health.toFixed(1)}%
                </div>

                {/* Direction Arrow */}
                <div className={`absolute bottom-8 ${statusColor}`}>
                    <ArrowRight className="w-5 h-5" />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] p-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Zap className="w-8 h-8 text-indigo-500" />
                    VTwin Overview
                </h1>
                <p className="text-slate-500 mt-2">Simplified Abstract Topology & Operational Status</p>
            </div>

            {/* MAIN ABSTRACT DIAGRAM */}
            <div className="w-full overflow-x-auto pb-8">
                <div className="flex items-center justify-between min-w-[1000px] px-4">

                    {sensors.map((sensor, i) => {
                        const reading = getSensorReading(sensor.id);
                        const isWarning = sensor.status === 'warning';
                        const isCritical = sensor.status === 'critical';

                        return (
                            <React.Fragment key={sensor.id}>
                                {/* SENSOR CARD */}
                                <div className="relative z-10">
                                    <CeramicCard className={`w-48 p-4 border-2 transition-all duration-300 ${isCritical ? 'border-red-500 shadow-red-500/20 shadow-lg' :
                                            isWarning ? 'border-amber-500 shadow-amber-500/20 shadow-lg' :
                                                'border-white dark:border-slate-700'
                                        }`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{sensor.name}</span>
                                            {isCritical ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                                                isWarning ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs text-slate-500 uppercase font-semibold">Pressure</span>
                                                <span className="font-mono font-bold text-lg text-slate-800 dark:text-white">
                                                    {reading.pressure.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${(reading.pressure / 100) * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <span className="text-xs text-slate-400">Vibration</span>
                                                <span className={`text-xs font-mono font-bold ${reading.vibration > 0.5 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {reading.vibration.toFixed(2)}G
                                                </span>
                                            </div>
                                        </div>
                                    </CeramicCard>

                                    {/* Location Tag */}
                                    <div className="absolute -bottom-8 left-0 right-0 text-center">
                                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                                            {sensor.location}
                                        </Badge>
                                    </div>
                                </div>

                                {/* CONNECTOR PIPE */}
                                {renderConnector(sensor, i)}
                            </React.Fragment>
                        );
                    })}

                </div>
            </div>

            {/* Legend / Info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <CeramicCard className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">System Nominal</div>
                        <div className="text-xs text-slate-500">Segments operating within parameters</div>
                    </div>
                </CeramicCard>
                <CeramicCard className="p-4 flex items-center gap-4 border-l-4 border-amber-500">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Warning Detected</div>
                        <div className="text-xs text-slate-500">Segment C-D requires inspection</div>
                    </div>
                </CeramicCard>
            </div>
        </div>
    );
}
