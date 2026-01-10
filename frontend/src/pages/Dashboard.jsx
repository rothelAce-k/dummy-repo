import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Activity,
  Brain,
  Database,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Zap,
  Cpu,
  Clock
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { CeramicCard } from '../components/ui/CeramicCard'
import { Badge } from '../components/ui/Badge'
import { modelApi, leakApi } from '../lib/api'
import { cn } from '../lib/utils'
import { useSensor } from '../contexts/SensorContext'

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
}

// --- GLASS TOOLTIP COMPONENT ---
const GlassTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {entry.name}: {Number(entry.value).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Mock Data Generator
const generateSparklineData = (points = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: 50 + Math.random() * 30 + Math.sin(i / 2) * 20
  }))
}

const StatCard = ({ title, value, unit, trend, subtext, icon: Icon, color, loading, className }) => (
  <CeramicCard className={cn("flex flex-col justify-between", className)} spotlight={true}>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground font-sans">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="flex items-baseline gap-1 fluid-text">
            <h4 className="text-3xl font-bold text-foreground tracking-tight">{value}</h4>
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
          </div>
        )}
      </div>
      <div className={cn(
        "p-3 rounded-xl border mt-1 transition-colors duration-300",
        `bg-${color}-500/10 border-${color}-200 dark:border-${color}-500/20`
      )}>
        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>

    <div className="mt-4">
      {subtext ? (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full bg-${color}-500 animate-pulse`}></div>
          <span className="text-xs font-medium text-slate-500">{subtext}</span>
        </div>
      ) : trend ? (
        <div className="flex items-center gap-2">
          <Badge variant={trend > 0 ? 'success' : 'danger'} className="gap-1 h-5 px-1.5 min-w-[3rem] justify-center text-[10px]">
            {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </Badge>
          <span className="text-xs text-slate-400">vs last hour</span>
        </div>
      ) : null}
    </div>

    {/* Sparkline Overlay */}
    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 dark:opacity-20 pointer-events-none mask-gradient-b">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={generateSparklineData()}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={`var(--color-${color}-500)`}
            fill={`var(--color-${color}-500)`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </CeramicCard>
)


export default function Dashboard() {
  const { sensors, history, systemHealth, isLive, setIsLive, runDiagnostics, isDiagnosing } = useSensor()
  const [aiConfidence, setAiConfidence] = React.useState(98.4);

  // EFFECT: Simulate AI Confidence Fluctuation (Alive Feel)
  React.useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setAiConfidence(prev => {
        const change = (Math.random() * 0.4) - 0.2; // Small shift +/- 0.2
        let next = prev + change;
        // Clamp between 97.5 and 99.5
        if (next > 99.5) next = 99.5;
        if (next < 97.5) next = 97.5;
        return next;
      });
    }, 3000); // Slow update every 3s
    return () => clearInterval(interval);
  }, [isLive]);

  // HANDLER: Run Diagnostics Simulation
  const handleDiagnostics = () => {
    if (isLive) {
      setIsLive(false);
      return; // Just pause if already live
    }

    // Call Global Diagnostics from Context
    const promise = runDiagnostics();

    toast.promise(promise, {
      loading: (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-900 dark:text-white">Diagnostics Running...</span>
          <span className="text-xs text-slate-500 font-mono">Verifying BaseDb Stream</span>
        </div>
      ),
      success: 'All Systems Nominal. Live Feed Resumed.',
      error: 'Diagnostics Failed',
    });
  };

  // Derived Metrics (Calculated here to keep Context simple)
  // 1. Online Sensors: If PAUSED, show 0. If LIVE, show actual count.
  const onlineSensors = isLive ? sensors.filter(s => s.status !== 'offline').length : 0;

  // 2. Critical Sensors (Always show real status, even if paused)
  const criticalSensors = sensors.filter(s => s.status === 'critical').length;

  // 3. Health Score
  const healthScore = systemHealth ? systemHealth.toFixed(1) : 0;

  // 4. Chart Data
  const mainChartData = history || [];

  // MOCK API CALLS (Can be ignored as we drive data from Context now)

  // Determine system status
  let systemStatus = "System Online"
  let statusColor = "success"
  if (!isLive) { systemStatus = "Diagnostics Paused"; statusColor = "secondary"; }
  else if (criticalSensors > 0) { systemStatus = "Critical Alert"; statusColor = "destructive"; }
  else if (systemHealth < 90) { systemStatus = "Maintenance Due"; statusColor = "warning"; }

  const { data: metrics } = useQuery({
    queryKey: ['model-metrics'],
    queryFn: () => modelApi.getMetrics().then(res => res.data).catch(() => null),
  })

  // We can keep leakStats query for other metadata but override the counts with our live simulation
  const { data: leakStats, isLoading: statsLoading } = useQuery({
    queryKey: ['leak-stats'],
    queryFn: () => leakApi.getStats().then(res => res.data).catch(() => null),
    refetchInterval: 5000,
  })

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Real-time infrastructure overview via <span className="text-primary font-semibold">AIPIS</span>.
          </p>
        </div>
        <Badge variant={isLive ? 'success' : 'secondary'} className={cn(
          "h-10 px-4 text-sm gap-2 transition-all duration-500",
          isLive
            ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-lg shadow-emerald-500/10 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/30"
            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
        )}>
          <div className={cn("h-2.5 w-2.5 rounded-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
          {isLive ? "System Online" : "Diagnostics Paused"}
        </Badge>
      </motion.div>

      {/* Bento Grid Layout */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Large Stats */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <StatCard
            title="Active Sensors"
            value={`${onlineSensors}/${sensors.length}`}
            unit="Online"
            icon={Activity}
            color="blue"
            subtext="100% Signal Strength"
            loading={false}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <StatCard
            title="AI Confidence"
            value={`${aiConfidence.toFixed(1)}%`}
            icon={Brain}
            color="purple"
            subtext="Model Running Optimally"
            loading={false}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <StatCard
            title="Security Threats"
            value={criticalSensors > 0 ? `${criticalSensors}` : "Zero"}
            icon={ShieldAlert}
            color={criticalSensors > 0 ? "red" : "emerald"}
            subtext={criticalSensors > 0 ? "Immediate Action Required" : "System Secure"}
            loading={false}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <StatCard
            title="Data Processed"
            value="1.9"
            unit="TB"
            icon={Database}
            color="cyan"
            trend={12.5}
            className="h-full"
          />
        </motion.div>

        {/* Cinematic Main Chart - Spans 2 rows, 3 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-3 lg:row-span-2">
          <CeramicCard className="p-0 overflow-hidden flex flex-col h-full">
            {/* Main Fluid Dynamics Chart */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-white/5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Fluid Metrics</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Real-time pressure and flow telemetry</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className={cn(
                  "transition-colors duration-300 font-bold tracking-wider",
                  isLive
                    ? "bg-rose-50 !text-rose-600 !border-rose-200 dark:bg-rose-900/20 dark:!text-rose-400 dark:!border-rose-900/50 animate-pulse"
                    : "bg-slate-50 !text-slate-500 !border-slate-200"
                )}>
                  {isLive ? "● LIVE FEED" : "OFFLINE"}
                </Badge>
              </div>
            </div>

            <div className="flex-1 p-6 relative min-h-[300px] bg-white dark:bg-transparent">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mainChartData}>
                  <defs>
                    <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                    labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pressure"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPressure)"
                    name="Pressure (PSI)"
                  />
                  <Area
                    type="monotone"
                    dataKey="flow"
                    stroke="#0891b2"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorFlow)"
                    name="Flow Rate (L/min)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CeramicCard>
        </motion.div>

        {/* Vertical Health Stack */}
        <motion.div variants={itemVariants} className="lg:col-span-1 lg:row-span-2 h-full">
          <CeramicCard className="flex flex-col gap-6 h-full">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Health Score</h3>
              <div className="relative pt-2">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-bold text-emerald-500">{healthScore}<span className="text-lg text-slate-400">%</span></span>
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{healthScore > 90 ? 'Exemplary' : healthScore > 70 ? 'Good' : 'At Risk'}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${healthScore}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu className="h-5 w-5 text-indigo-500" />
                  <span className="font-semibold text-indigo-900 dark:text-indigo-200">ML Latency</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">12<span className="text-sm text-slate-400 font-normal">ms</span></span>
                  <span className="text-xs text-indigo-400">Optimal</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/10">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-amber-900 dark:text-amber-200">System Uptime</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">99.9<span className="text-sm text-slate-400 font-normal">%</span></span>
                  <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">Stable</Badge>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={handleDiagnostics}
                disabled={isDiagnosing}
                className={cn(
                  "w-full py-2.5 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2",
                  isLive
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] hover:shadow-xl',
                  isDiagnosing && "opacity-80 cursor-wait"
                )}
              >
                {isDiagnosing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Running Diagnostics...</span>
                  </>
                ) : isLive ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    Pause Diagnostics
                  </>
                ) : (
                  "Run System Diagnostics"
                )}
              </button>
            </div>
          </CeramicCard>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
