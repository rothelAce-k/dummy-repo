
import React from 'react';
import { FileText, ChevronRight, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 50 }
    }
};

export default function InvestigationPreview({ reliability, onViewReport, className }) {
    // This component mirrors the size/shape of the "Recommended Action" panel
    // It serves as the entry point to the deep investigation
    const isWide = className && className.includes('w-full');

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={`arch-card p-6 border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900 h-full ${isWide ? 'flex flex-row items-center justify-between gap-8' : 'flex flex-col justify-between'}`}
        >
            <div className={isWide ? 'flex-1 flex items-center gap-8' : ''}>
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <Activity className="text-indigo-500 animate-pulse" size={20} />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Investigation Ready
                        </h4>
                    </motion.div>

                    <motion.h3 variants={itemVariants} className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Material Failure Detected
                    </motion.h3>

                    <motion.p variants={itemVariants} className="text-sm text-slate-500 leading-relaxed max-w-xl">
                        AI Analysis has classified this anomaly with <strong>98.4% Confidence</strong>. Forensic data package is ready for review.
                    </motion.p>
                </div>

                {isWide && (
                    <motion.div variants={itemVariants} className="flex items-center gap-6 text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div>
                            <span className="block text-slate-300 uppercase text-[10px]">Pattern Match</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">SCC-Type-B</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-600"></div>
                        <div>
                            <span className="block text-slate-300 uppercase text-[10px]">Predicted Impact</span>
                            <span className="font-bold text-rose-600 text-lg">CRITICAL</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-600"></div>
                        <div>
                            <span className="block text-slate-300 uppercase text-[10px]">Root Cause</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">H2S Fatigue</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {!isWide && (
                <motion.div variants={itemVariants} className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mt-4 mb-4">
                    <div>
                        <span className="block text-slate-300 uppercase text-[10px]">Pattern</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">SCC-Type-B</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
                    <div>
                        <span className="block text-slate-300 uppercase text-[10px]">Impact</span>
                        <span className="font-bold text-rose-600">CRITICAL</span>
                    </div>
                </motion.div>
            )}

            <motion.div variants={itemVariants} className={isWide ? 'w-auto' : 'w-full'}>
                <Button
                    onClick={onViewReport}
                    className={`${isWide ? 'px-8 py-6 text-lg' : 'w-full mt-6'} bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all hover:scale-105`}
                >
                    <FileText size={isWide ? 20 : 16} />
                    View Detailed Report
                    <ChevronRight size={isWide ? 20 : 16} />
                </Button>
            </motion.div>
        </motion.div>
    );
}
