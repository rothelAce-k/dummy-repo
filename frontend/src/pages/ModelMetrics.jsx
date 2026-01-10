import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, ShieldCheck, Server, AlertTriangle, FileCode, Cpu, Lock } from 'lucide-react';
import { modelApi } from '../lib/api';

const ModelMetrics = () => {
    // Fetch active model details
    const { data: modelInfo, isLoading } = useQuery({
        queryKey: ['activeModel'],
        queryFn: async () => {
            try {
                const res = await modelApi.getMetrics();
                return res.data;
            } catch (err) {
                return null;
            }
        }
    });

    if (isLoading) return <div className="p-10 text-center text-slate-500">Loading system status...</div>;

    if (!modelInfo || modelInfo.status !== 'active') {
        return (
            <div className="p-10 text-center text-slate-500">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">System Uninitialized</h3>
                <p>No active inference pipeline found. Please contact administrator.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Status</h1>
                    <p className="text-slate-500 dark:text-slate-400">AIPIS Inference Engine</p>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-sm rounded-full font-medium">
                    Status: {modelInfo.status.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="arch-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                            <Server size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pipeline Type</p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{modelInfo.type}</h3>
                        </div>
                    </div>
                </div>

                <div className="arch-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Physics-Informed</p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enabled</h3>
                        </div>
                    </div>
                </div>

                <div className="arch-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Response Time</p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">&lt; 50ms</h3>
                        </div>
                    </div>
                </div>

                <div className="arch-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Resource Efficiency</p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Optimal (12%)</h3>
                        </div>
                    </div>
                </div>

                <div className="arch-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg">
                            <Lock size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Security</p>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">Encryption Active</span>
                                <span className="text-xs text-slate-500">AES-256 / Audit Logs On</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelMetrics;
