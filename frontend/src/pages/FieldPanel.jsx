import React from 'react';
import { useSensor } from '../contexts/SensorContext';
import { ClipboardList, Radio, AlertCircle, CheckCircle } from 'lucide-react';

export default function FieldPanel() {
    const { sensors, segmentHealth, getSensorReading } = useSensor();

    return (
        <div className="min-h-[calc(100vh-4rem)] p-8 bg-gray-50 dark:bg-zinc-900 animate-in fade-in duration-300">
            {/* Header - Flat & Simple */}
            <div className="mb-8 border-b-2 border-gray-200 dark:border-zinc-700 pb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <ClipboardList className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    Field Operations Monitor
                </h1>
                <p className="text-gray-500 mt-1 text-sm">Live System Status // Operator View</p>
            </div>

            {/* 1. THE METRO LINE DIAGRAM (Flat CSS) */}
            <div className="w-full bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 p-8 mb-8 rounded-sm">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8">Pipeline Topology Map</h2>

                <div className="relative flex items-center justify-between px-12">
                    {/* The Base Line */}
                    <div className="absolute left-12 right-12 h-2 bg-gray-200 dark:bg-zinc-600 top-1/2 -translate-y-1/2 z-0" />

                    {/* Segments & Nodes */}
                    {sensors.map((sensor, i) => {
                        const isLast = i === sensors.length - 1;
                        const reading = getSensorReading(sensor.id);
                        const status = sensor.status;

                        // Determine color for the segment AFTER this node
                        let nextSegmentColor = 'bg-gray-200 dark:bg-zinc-600';
                        if (!isLast) {
                            const nextSensor = sensors[i + 1];
                            const segKey = `${sensor.id.split('_')[1]}-${nextSensor.id.split('_')[1]}`;
                            const health = segmentHealth[segKey] || 100;
                            if (health < 90) nextSegmentColor = 'bg-amber-400';
                            if (health < 75) nextSegmentColor = 'bg-red-500';
                        }

                        // Flat Status Colors
                        const nodeColor = status === 'normal' ? 'bg-blue-600' : status === 'warning' ? 'bg-amber-500' : 'bg-red-600';
                        const ringColor = status === 'normal' ? 'border-blue-100' : status === 'warning' ? 'border-amber-100' : 'border-red-100';

                        return (
                            <React.Fragment key={sensor.id}>
                                {/* The Node */}
                                <div className="relative z-10 flex flex-col items-center">
                                    {/* Simple Status Dot */}
                                    <div className={`w-8 h-8 rounded-full ${nodeColor} border-4 border-white dark:border-zinc-800 shadow-sm flex items-center justify-center`}>
                                        <div className="w-2 h-2 bg-white rounded-full opacity-50" />
                                    </div>

                                    {/* Label */}
                                    <div className="mt-3 text-center">
                                        <div className="font-bold text-gray-700 dark:text-gray-200 text-sm">{sensor.name}</div>
                                        <div className="font-mono text-xs text-gray-500">{reading.pressure.toFixed(1)} PSI</div>
                                    </div>
                                </div>

                                {/* The Segment Line (Colored Overlay) */}
                                {!isLast && (
                                    <div className="flex-1 h-2 relative z-0 mx-[-1px]"> {/* Negative margin to connect */}
                                        <div className={`absolute inset-0 ${nextSegmentColor} transition-colors duration-500`} />
                                        {/* Simple Activity Indicator */}
                                        {nextSegmentColor === 'bg-amber-400' && (
                                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* 2. OPERATOR DATA GRID (Flat Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensors.map(sensor => {
                    const reading = getSensorReading(sensor.id);
                    const isWarning = sensor.status === 'warning';
                    const isCritical = sensor.status === 'critical';

                    return (
                        <div key={sensor.id} className={`
                            bg-white dark:bg-zinc-800 p-5 rounded-sm border-l-4 shadow-sm
                            ${isCritical ? 'border-l-red-500' : isWarning ? 'border-l-amber-500' : 'border-l-blue-500'}
                        `}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{sensor.name}</h3>
                                    <span className="text-xs font-mono text-gray-400">{sensor.id}</span>
                                </div>
                                {isWarning || isCritical ?
                                    <AlertCircle className={`w-6 h-6 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} /> :
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                }
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-sm">
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Pressure</div>
                                    <div className="text-xl font-mono font-bold text-gray-800 dark:text-gray-200">
                                        {reading.pressure.toFixed(1)}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-sm">
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Flow</div>
                                    <div className="text-xl font-mono font-bold text-gray-800 dark:text-gray-200">
                                        {reading.flow.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
