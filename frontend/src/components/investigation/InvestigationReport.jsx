
import React, { useState, useEffect } from 'react';
import {
    X, Download, Share2, Shield, AlertTriangle,
    Activity, TrendingDown, TrendingUp, Cpu, FileText, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Legend, ComposedChart, Area, PieChart, Pie
} from 'recharts';
import { getInvestigationData } from '../../utils/mockAnalysis';
import { generateReportPDF } from '../../utils/pdfGenerator';
import { toast } from 'sonner';

export default function InvestigationReport({ segmentId, isOpen, onClose }) {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, tech, operational
    const [isGenerating, setIsGenerating] = useState(true);

    useEffect(() => {
        if (isOpen && segmentId) {
            setIsGenerating(true);
            // Simulate "Processing" time for realism
            setTimeout(() => {
                setData(getInvestigationData(segmentId));
                setIsGenerating(false);
            }, 1200);
        }
    }, [segmentId, isOpen]);

    if (!isOpen) return null;

    const handleDownload = () => {
        if (!data) return;
        toast.promise(
            new Promise((resolve, reject) => {
                try {
                    generateReportPDF(data);
                    setTimeout(resolve, 1000); // Small delay to let PDF generation happen
                } catch (err) {
                    console.error("Download failed:", err);
                    reject(err);
                }
            }),
            {
                loading: 'Compiling Forensic Packet (PDF)...',
                success: `Report ${data.id} Downloaded Successfully`,
                error: 'Download Failed'
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-950 w-full max-w-5xl h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">

                {/* 1. HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <FileText className="text-rose-600 dark:text-rose-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Investigation Report</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-mono">ID: {data?.id || '---'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Cpu size={12} /> Verified by {data?.verifiedBy || 'AI Model'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={isGenerating}>
                            <Download size={16} />
                            Export PDF
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X size={24} />
                        </Button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-6">
                    {isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-mono animate-pulse">Running Forensic Analysis...</p>
                        </div>
                    ) : !data ? (
                        <div className="text-center py-20 text-slate-500">No Investigation Data Available for this Segment.</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* LEFT COLUMN: VERDICT & IMPACT */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* VERDICT CARD */}
                                <Card className="border-l-4 border-l-rose-500 shadow-sm">
                                    <CardHeader>
                                        <CardHeader>
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider !text-slate-900 dark:!text-slate-400">Automated Verdict</CardTitle>
                                        </CardHeader>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-1">{data.verdict.title}</h3>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{data.verdict.subtitle}</p>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div className="relative w-24 h-24 flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={[{ value: data.verdict.confidence }, { value: 100 - data.verdict.confidence }]}
                                                            innerRadius={28}
                                                            outerRadius={38}
                                                            startAngle={90}
                                                            endAngle={-270}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            <Cell fill="#0ea5e9" /> {/* Sky 500 */}
                                                            <Cell fill="var(--color-slate-200)" className="fill-slate-200 dark:fill-slate-800" />
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <div className="text-xl font-bold text-slate-900 dark:text-white">{Math.round(data.verdict.confidence)}%</div>
                                                    <div className="text-[8px] uppercase text-slate-400 font-bold">Conf.</div>
                                                </div>
                                            </div>
                                            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-rose-600">98.4%</div>
                                                <div className="text-[10px] uppercase text-rose-400 font-bold">Pattern Match</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold uppercase text-slate-400">Logic Gates Triggered</h4>
                                            {data.verdict.logic.map((rule, i) => (
                                                <div key={i} className="flex items-center justify-between text-xs p-2 bg-rose-50 dark:bg-rose-900/10 rounded text-rose-700 dark:text-rose-300">
                                                    <span className="font-mono">{rule.condition}</span>
                                                    <CheckCircle size={12} />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* IMPACT CARD */}
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardHeader>
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider !text-slate-900 dark:!text-slate-400">Operational Impact</CardTitle>
                                        </CardHeader>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                <div className="text-xs text-slate-500">Vol Lost</div>
                                                <div className="text-lg font-bold text-slate-900 dark:text-white">{data.impact.volumeLost}</div>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                <div className="text-xs text-slate-500">Cost Est.</div>
                                                <div className="text-lg font-bold text-slate-900 dark:text-white">{data.impact.costEstimate}</div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                                            <span className="font-bold flex items-center gap-2"><AlertTriangle size={14} /> Environment Risk: {data.impact.envRisk}</span>
                                            <p className="opacity-80 mt-1 text-xs">High probability of regulatory fine due to H2S release.</p>
                                        </div>
                                        <Button className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 font-bold">
                                            Execute: {data.recommendations[0].action}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: DETAILED CHARTS */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* 30 DAY CHART */}
                                <Card className="shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider !text-slate-900 dark:!text-slate-400">30-Day Forensic Timeline</CardTitle>
                                        <Badge variant="outline" className="!text-slate-900 dark:!text-slate-200 !border-slate-300 dark:!border-slate-700">High Resolution</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={data.charts.trends}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                                                    <XAxis dataKey="day" hide />
                                                    <YAxis yAxisId="left" orientation="left" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v} psi`} />
                                                    <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={10} tickFormatter={(v) => `${v.toFixed(2)} mm`} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                    />
                                                    <Legend />
                                                    <Area yAxisId="left" type="monotone" dataKey="pressure" fill="url(#colorPressure)" stroke="#64748b" fillOpacity={0.1} name="Pressure (PSI)" />
                                                    <Line yAxisId="right" type="monotone" dataKey="corrosion" stroke="#e11d48" strokeWidth={3} dot={false} name="Corrosion (mm/y)" />
                                                    <defs>
                                                        <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 text-xs text-slate-500 italic text-center">
                                            "Inverse correlation detected: As Corrosion (Red) rises, Pressure Capacity (Grey) degrades dangerously."
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* FFT SPECTRUM */}
                                    <Card className="shadow-sm">
                                        <CardHeader>
                                            <CardHeader>
                                                <CardTitle className="text-xs font-bold uppercase tracking-wider !text-slate-900 dark:!text-slate-400">Vibration Spectrum (FFT)</CardTitle>
                                            </CardHeader>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[180px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={data.charts.fft}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                                                        <XAxis dataKey="freq" fontSize={10} stroke="#94a3b8" />
                                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                                                        <Bar dataKey="amp" radius={[4, 4, 0, 0]}>
                                                            {data.charts.fft.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.type.includes('Leak') ? '#e11d48' : '#3b82f6'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-2 text-[10px] text-center text-rose-500 font-bold">
                                                High Frequency "Hiss" (20-25kHz) detected above background noise.
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* FEATURE IMPORTANCE */}
                                    <Card className="shadow-sm">
                                        <CardHeader>
                                            <CardHeader>
                                                <CardTitle className="text-xs font-bold uppercase tracking-wider !text-slate-900 dark:!text-slate-400">Contribution Analysis (XAI)</CardTitle>
                                            </CardHeader>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {data.charts.features.map((feature, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between text-xs font-bold mb-1">
                                                        <span>{feature.name}</span>
                                                        <span>{feature.value}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{ width: `${feature.value}%`, backgroundColor: feature.color }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                *SHAP Values indicate "Corrosion Rate" was the primary driver for this fault classification.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
