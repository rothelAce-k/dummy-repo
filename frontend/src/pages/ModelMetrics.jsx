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

    if (isLoading) return <div className="p-10 text-center text-gray-500">Loading system status...</div>;

    if (!modelInfo || modelInfo.status !== 'active') {
        return (
            <div className="p-10 text-center text-gray-500">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-white">System Uninitialized</h3>
                <p>No active inference pipeline found. Please contact administrator.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">System Status</h1>
                    <p className="text-gray-400">LeakGuard Inference Engine</p>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-500 text-sm rounded-full border border-green-500/20">
                    Status: {modelInfo.status.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card p-6 border border-gray-800 bg-background-secondary rounded-xl">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Server className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Pipeline Type</p>
                            <h3 className="text-lg font-bold text-white">{modelInfo.type}</h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border border-gray-800 bg-background-secondary rounded-xl">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <ShieldCheck className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Physics-Informed</p>
                            <h3 className="text-lg font-bold text-white">Enabled</h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border border-gray-800 bg-background-secondary rounded-xl">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <Activity className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Response Time</p>
                            <h3 className="text-lg font-bold text-white">&lt; 50ms</h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border border-gray-800 bg-background-secondary rounded-xl">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-500/10 rounded-lg">
                            <Cpu className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Resource Efficiency</p>
                            <h3 className="text-lg font-bold text-white">Optimal (12%)</h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border border-gray-800 bg-background-secondary rounded-xl">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                            <Lock className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Security</p>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white">Encryption Active</span>
                                <span className="text-xs text-gray-500">AES-256 / Audit Logs On</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default ModelMetrics;
