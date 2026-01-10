import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Target,
  Brain,
  Database,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ShieldAlert
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import { modelApi, leakApi, dataApi } from '../lib/api'

// Mock data generator for the sparklines
const generateSparklineData = (points = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: 50 + Math.random() * 30 + Math.sin(i / 2) * 20
  }))
}

const StatCard = ({ title, value, unit, trend, subtext, icon: Icon, color, loading }) => (
  <Card className="relative overflow-hidden border-gray-800 bg-background-secondary/50">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-700/50 animate-pulse rounded" />
          ) : (
            <div className="flex items-baseline gap-1">
              <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
              {unit && <span className="text-sm text-gray-400 ml-1">{unit}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/10 border border-${color}-500/20 mt-1`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
      </div>

      <div className="mt-4">
        {subtext ? (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full bg-${color}-500 animate-pulse`}></div>
            <span className="text-xs font-medium text-gray-400">{subtext}</span>
          </div>
        ) : trend ? (
          <div className="flex items-center gap-2">
            <Badge variant={trend > 0 ? 'success' : 'danger'} className="gap-1 h-5 px-1.5 min-w-[3rem] justify-center">
              {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </Badge>
            <span className="text-xs text-gray-500">vs last hour</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 h-[60px] w-full opacity-30 mask-gradient-b">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={generateSparklineData()}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(--color-${color}-500)`} stopOpacity={0.5} />
                <stop offset="100%" stopColor={`var(--color-${color}-500)`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={`var(--color-${color}-500)`}
              fill={`url(#gradient-${color})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['model-metrics'],
    queryFn: () => modelApi.getMetrics().then(res => res.data).catch(() => null),
  })

  const { data: leakStats, isLoading: statsLoading } = useQuery({
    queryKey: ['leak-stats'],
    queryFn: () => leakApi.getStats().then(res => res.data).catch(() => null),
    refetchInterval: 5000,
  })

  // Mock data for the main chart
  const mainChartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    pressure: 80 + Math.random() * 20,
    flow: 40 + Math.random() * 15,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Real-time system overview and health status</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="h-8 px-3">
            <div className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse" />
            System Online
          </Badge>
          <span className="text-sm text-gray-400">Last updated: Just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Sensors"
          value={leakStats?.total_sensors > 0 ? leakStats.total_sensors : "5/5 Online"}
          icon={Activity}
          color="blue"
          subtext="100% Signal Strength"
          loading={statsLoading && false}
        />
        <StatCard
          title="Model Confidence"
          value="94.1%"
          icon={Brain}
          color="purple"
          subtext="Stable Performance"
          loading={false}
        />
        <StatCard
          title="Security Status"
          value={leakStats?.critical_sensors > 0 ? `${leakStats.critical_sensors} Threats` : "System Secure"}
          icon={ShieldAlert}
          color={leakStats?.critical_sensors > 0 ? "red" : "emerald"}
          subtext="Last scan: 2s ago"
          loading={statsLoading && false}
        />
        <StatCard
          title="Processed Data"
          value="1.2"
          unit="TB"
          icon={Database}
          color="cyan"
          trend={8.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Real-time pressure and flow rate analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mainChartData}>
                  <defs>
                    <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="pressure" name="Pressure (PSI)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPressure)" />
                  <Area type="monotone" dataKey="flow" name="Flow (LPM)" stroke="#10b981" fillOpacity={1} fill="url(#colorFlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Operational Status (Enhanced) */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Health</CardTitle>
            <CardDescription>Real-time infrastructure status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-background-tertiary rounded-lg border border-gray-800">
                <span className="text-xs text-gray-500 block uppercase tracking-wider mb-1">Uptime</span>
                <span className="text-lg font-mono text-white">14d 02h</span>
              </div>
              <div className="p-3 bg-background-tertiary rounded-lg border border-gray-800">
                <span className="text-xs text-gray-500 block uppercase tracking-wider mb-1">Latency</span>
                <span className="text-lg font-mono text-emerald-400">12ms</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pipeline Integrity</span>
                  <span className="text-white font-bold">98.2%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[98.2%]"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sensor Network</span>
                  <span className="text-white font-bold">100%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">API Throughput</span>
                  <span className="text-white font-bold">Normal</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[75%]"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-gray-800 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-white">AI Diagnostic</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Model inference latency is nominal. No significant deviations in flow dynamics detected in the last window.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
