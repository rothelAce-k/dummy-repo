import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Activity, Zap, Wind } from 'lucide-react';

const HoloTag = ({ sensor, reading, x, y }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute z-50 pointer-events-none" // pointer-events-none to click through to underlying svg if needed, but usually we want to see it
            style={{ left: x, top: y }}
        >
            {/* Connector Line */}
            <svg className="absolute -top-12 -left-8 w-12 h-12 pointer-events-none overflow-visible">
                <path d="M 32 48 L 32 32 L 60 0" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" />
                <circle cx="32" cy="48" r="3" fill="#3b82f6" />
            </svg>

            <GlassCard className="w-56 p-3 backdrop-blur-xl bg-slate-900/80 border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
                <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                    <div>
                        <div className="text-xs text-blue-400 font-mono font-bold tracking-wider uppercase">
                            {sensor.id}
                        </div>
                        <div className="text-sm font-bold text-white">
                            {sensor.name}
                        </div>
                    </div>
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${sensor.status === 'normal' ? 'bg-emerald-500/20 text-emerald-400' :
                            sensor.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {sensor.status}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Activity className="w-3 h-3 text-blue-500" /> Pressure
                        </div>
                        <div className="font-mono text-white text-sm">
                            {reading?.pressure.toFixed(1)} <span className="text-[10px] text-slate-500">PSI</span>
                        </div>
                    </div>

                    {/* Tiny Sparkline Bar */}
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500"
                            animate={{ width: `${Math.min(100, (reading?.pressure / 100) * 100)}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Zap className="w-3 h-3 text-amber-500" /> Vibration
                        </div>
                        <div className="font-mono text-white text-sm">
                            {reading?.vibration.toFixed(3)} <span className="text-[10px] text-slate-500">G</span>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default HoloTag;
