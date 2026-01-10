import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ShieldAlert, AlertTriangle, CheckCircle, Play, RefreshCw, Upload, Activity, Link } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export default function LeakDetection() {
  const [selectedDataset, setSelectedDataset] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)
  const isSimulatingRef = useRef(false)
  const [simulationData, setSimulationData] = useState([])
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [generatedAlerts, setGeneratedAlerts] = useState([])

  const simulationRef = useRef(null)
  const datasetContentRef = useRef([])
  const stepRef = useRef(0)

  // Fetch available datasets
  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/data/datasets`)
      return res.data
    }
  })

  // Helper for confidence labels
  const getConfidenceLabel = (prediction) => {
    if (!prediction || !prediction.leak_class) return 'System Offline'
    if (prediction.leak_class === 'none') return 'System Normal'

    const prob = prediction.leak_probability
    if (prob > 0.75) return 'Confirmed Leak'
    if (prob > 0.50) return 'Suspected Leak'
    return 'Potential Anomaly'
  }

  // Data streaming logic
  const processStep = async () => {
    if (!isSimulatingRef.current || stepRef.current >= datasetContentRef.current.length) {
      setIsSimulating(false)
      isSimulatingRef.current = false
      if (stepRef.current >= datasetContentRef.current.length) {
        toast.success('Simulation complete')
      }
      return
    }

    const row = datasetContentRef.current[stepRef.current]

    try {
      const payload = {
        pressure_psi: parseFloat(row.pressure_psi),
        flow_rate_lpm: parseFloat(row.flow_rate_lpm),
        temperature_c: parseFloat(row.temperature_c),
        vibration_gforce: parseFloat(row.vibration_gforce),
        acoustic_db: parseFloat(row.acoustic_db),
        timestamp: new Date().toISOString()
      }

      const res = await axios.post(`${API_URL}/leak/stream`, payload)
      const result = res.data

      setCurrentPrediction(result)

      setSimulationData(prev => {
        const newData = [...prev, { ...payload, ...result }]
        if (newData.length > 50) newData.shift()
        return newData
      })

      if (result.alert_generated) {
        const confLabel = result.leak_probability > 0.75 ? 'Confirmed' :
          result.leak_probability > 0.50 ? 'Suspected' : 'Potential'

        setGeneratedAlerts(prev => [{
          id: Date.now(),
          severity: result.severity,
          message: `${confLabel} ${result.leak_class === 'slow' ? 'Medium' : result.leak_class} Detected`,
          timestamp: new Date().toISOString()
        }, ...prev].slice(0, 10))
      }

      stepRef.current += 1
      simulationRef.current = setTimeout(processStep, 200)

    } catch (err) {
      console.error("Simulation error", err)
      setIsSimulating(false)
      isSimulatingRef.current = false
    }
  }

  const startSimulation = async () => {
    if (!selectedDataset) {
      toast.error("Please select a dataset first")
      return
    }

    setSimulationData([])
    setGeneratedAlerts([])
    stepRef.current = 0

    try {
      toast.loading("Loading dataset...", { id: "loading-data" })
      const res = await axios.get(`${API_URL}/data/datasets/${selectedDataset}/download`, {
        responseType: 'text'
      })

      const text = res.data
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())

      const data = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const values = lines[i].split(',')
        const obj = {}
        headers.forEach((h, index) => {
          obj[h] = values[index]
        })
        data.push(obj)
      }

      datasetContentRef.current = data
      toast.dismiss("loading-data")

      setIsSimulating(true)
      isSimulatingRef.current = true
      processStep()

    } catch (err) {
      toast.error("Failed to load dataset")
      console.error(err)
    }
  }

  const stopSimulation = () => {
    setIsSimulating(false)
    isSimulatingRef.current = false
    if (simulationRef.current) clearTimeout(simulationRef.current)
  }

  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false)

  useEffect(() => {
    return () => {
      isSimulatingRef.current = false
      if (simulationRef.current) clearTimeout(simulationRef.current)
    }
  }, [])

  // Refactored Modal (Luminary Style)
  const LiveStreamModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Sensor Stream</h2>
              <p className="text-sm text-slate-500">Configure real-time data ingestion</p>
            </div>
          </div>
          <button
            onClick={() => setIsStreamModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Connect to New Stream
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-5 border border-slate-100 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 mb-4">
                Configure and connect to a real-time sensor data stream. This feature is unavailable in simulation mode.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-semibold">Protocol</label>
                  <select disabled className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-md px-3 py-2 text-sm">
                    <option>WebSocket (Secure)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-semibold">Gateway ID</label>
                  <input
                    type="text"
                    value="IOT-GTW-009"
                    disabled
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-md px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button disabled className="w-full bg-indigo-100 text-indigo-400 cursor-not-allowed">
                  <Activity className="w-4 h-4 mr-2" />
                  Connect Stream (Simulation Mode Active)
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="secondary" onClick={() => setIsStreamModalOpen(false)}>
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  )


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-indigo-500" />
            Live Simulation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Select a dataset to simulate real-time sensor behavior.</p>
        </div>

        <div className="flex gap-3">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-0"
            onClick={() => setIsStreamModalOpen(true)}
          >
            <Link className="w-4 h-4 mr-2" />
            Live Sensor Stream
          </Button>

          <select
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setSelectedDataset(e.target.value)}
            value={selectedDataset}
            disabled={isSimulating}
          >
            <option value="">-- Select Dataset --</option>
            {datasets?.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.row_count} rows)</option>
            ))}
          </select>

          {!isSimulating ? (
            <Button onClick={startSimulation} disabled={!selectedDataset} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              <Play className="w-4 h-4 mr-2" /> Start Simulation
            </Button>
          ) : (
            <Button onClick={stopSimulation} variant="destructive">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Stop
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Charts */}
        <div className="arch-card lg:col-span-2 bg-white dark:bg-slate-900">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sensor Telemetry</h3>
            <p className="text-sm text-slate-500">Real-time pressure and flow readings</p>
          </div>
          <div className="p-6 min-h-[300px]">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis yAxisId="left" stroke="hsl(var(--chart-1))" label={{ value: 'PSI', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" label={{ value: 'LPM', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="pressure_psi" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="flow_rate_lpm" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Gauge */}
        <div className="arch-card lg:col-span-1 bg-white dark:bg-slate-900">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leak Status</h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="text-slate-100 dark:text-slate-800" strokeWidth="12" fill="none" stroke="currentColor" />
                <circle
                  cx="96" cy="96" r="88"
                  className={`transition-all duration-500 ${currentPrediction?.leak_class === 'catastrophic' || currentPrediction?.leak_class === 'major' ? 'text-rose-500' :
                    currentPrediction?.leak_class === 'slow' || currentPrediction?.leak_class === 'medium' ? 'text-amber-500' :
                      currentPrediction?.leak_class === 'micro' ? 'text-yellow-500' :
                        currentPrediction?.leak_class === 'none' ? 'text-emerald-500' :
                          'text-slate-300'
                    }`}
                  strokeWidth="12"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - (currentPrediction?.leak_probability || 0))}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900 dark:text-white text-center px-2">
                  {getConfidenceLabel(currentPrediction)}
                </span>
                <span className="text-sm text-slate-500 uppercase tracking-widest mt-1">
                  {currentPrediction?.leak_class === 'slow' ? 'Medium' : (currentPrediction?.leak_class || 'IDLE')}
                </span>
              </div>
            </div>

            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <Badge variant={
                  (currentPrediction?.severity || 'info') === 'critical' ? 'danger' :
                    (currentPrediction?.severity || 'info') === 'high' ? 'warning' : 'success'
                }>
                  {(currentPrediction?.severity || 'Ready').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Action</span>
                <span className="text-slate-900 dark:text-white font-medium">{currentPrediction?.recommended_action || '-'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Alerts */}
      <div className="arch-card bg-white dark:bg-slate-900">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Session Alerts</h3>
        </div>
        <div className="p-6">
          {generatedAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No alerts generated in this session yet.</div>
          ) : (
            <div className="space-y-4">
              {generatedAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">SENSOR_001: {alert.message}</h4>
                      <span className="text-sm text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isStreamModalOpen && <LiveStreamModal />}
    </div>
  )
}

