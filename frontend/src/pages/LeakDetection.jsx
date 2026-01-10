import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ShieldAlert, AlertTriangle, CheckCircle, Play, RefreshCw, Upload, Activity, Link } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'

// API Base URL - using environment variable with a safe relative fallback
const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export default function LeakDetection() {
  const [selectedDataset, setSelectedDataset] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)
  const isSimulatingRef = useRef(false) // Track status synchronously for the loop
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
    // Check Ref, not State, to avoid closure staleness
    if (!isSimulatingRef.current || stepRef.current >= datasetContentRef.current.length) {
      setIsSimulating(false)
      isSimulatingRef.current = false
      if (stepRef.current >= datasetContentRef.current.length) {
        toast.success('Simulation complete')
      }
      return
    }

    const row = datasetContentRef.current[stepRef.current]

    // Convert CSV row to API payload (assuming mapping matches)
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

      // Update State
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

    // Fetch CSV content
    try {
      toast.loading("Loading dataset...", { id: "loading-data" })
      const res = await axios.get(`${API_URL}/data/datasets/${selectedDataset}/download`, {
        responseType: 'text'
      })

      // Simple CSV Parsing
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
      processStep() // Start immediately

    } catch (err) {
      toast.error("Failed to load dataset")
      console.error(err)
    }
  }

  const stopSimulation = () => {
    setIsSimulating(false)
    isSimulatingRef.current = false // Immediate stop signal
    if (simulationRef.current) clearTimeout(simulationRef.current)
  }

  // Modal State
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false)

  // Effect to clean up on unmount
  useEffect(() => {
    return () => {
      isSimulatingRef.current = false
      if (simulationRef.current) clearTimeout(simulationRef.current)
    }
  }, [])

  // Live Stream Modal Component
  const LiveStreamModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-gray-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl transform scale-100 transition-all">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Live Sensor Stream</h2>
              <p className="text-sm text-gray-400">Configure real-time data ingestion</p>
            </div>
          </div>
          <button
            onClick={() => setIsStreamModalOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Section 1: Connect New */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Connect to New Stream
            </h3>
            <div className="bg-background-tertiary/50 rounded-lg p-5 border border-gray-800 space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Configure and connect to a real-time sensor data stream. This feature is unavailable in simulation mode.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Protocol</label>
                  <select disabled className="w-full bg-[#020617] border border-gray-700 text-gray-400 rounded-md px-3 py-2 text-sm">
                    <option>WebSocket (Secure)</option>
                    <option>MQTT over WSS</option>
                    <option>gRPC Stream</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Gateway ID</label>
                  <input
                    type="text"
                    value="IOT-GTW-009"
                    disabled
                    className="w-full bg-[#020617] border border-gray-700 text-gray-500 rounded-md px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Frequency</label>
                  <input
                    type="text"
                    value="Real-time (1 Hz)"
                    disabled
                    className="w-full bg-[#020617] border border-gray-700 text-gray-500 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Auth Token</label>
                  <input
                    type="password"
                    value="************************"
                    disabled
                    className="w-full bg-[#020617] border border-gray-700 text-gray-500 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button disabled className="w-full bg-blue-600/50 text-blue-200 cursor-not-allowed hover:bg-blue-600/50">
                  <Activity className="w-4 h-4 mr-2" />
                  Connect Stream (Simulation Mode Active)
                </Button>
              </div>
            </div>
          </div>

          {/* Section 2: Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
              Current Stream Status
            </h3>
            <div className="bg-background-tertiary/30 rounded-lg p-4 border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                </div>
                <div>
                  <div className="text-sm text-gray-300 font-medium">No Live Stream Connected</div>
                  <div className="text-xs text-gray-500">Active Source: Local Simulation Engine</div>
                </div>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Latency</div>
                  <div className="text-sm font-mono text-gray-400">--- ms</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Packets</div>
                  <div className="text-sm font-mono text-gray-400">0/s</div>
                </div>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-400" />
            Live Simulation
          </h1>
          <p className="text-gray-400 mt-1">Select a dataset to simulate real-time sensor behavior.</p>
        </div>

        <div className="flex gap-3">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20"
            onClick={() => setIsStreamModalOpen(true)}
          >
            <Link className="w-4 h-4 mr-2" />
            Live Sensor Stream
          </Button>

          <select
            className="bg-background-tertiary border border-gray-700 text-white rounded-lg px-4 py-2"
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
            <Button onClick={startSimulation} disabled={!selectedDataset} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" /> Start Simulation
            </Button>
          ) : (
            <Button onClick={stopSimulation} variant="danger">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Stop
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Charts */}
        <Card className="lg:col-span-2 border-gray-800 bg-background-secondary/50">
          <CardHeader>
            <CardTitle>Sensor Telemetry</CardTitle>
            <CardDescription>Real-time pressure and flow readings</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis yAxisId="left" stroke="#60A5FA" label={{ value: 'PSI', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#34D399" label={{ value: 'LPM', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="pressure_psi" stroke="#60A5FA" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="flow_rate_lpm" stroke="#34D399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Main Status Gauge / Indicator */}
        <Card className="lg:col-span-1 border-gray-800 bg-background-secondary/50">
          <CardHeader>
            <CardTitle>Leak Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="text-gray-800" strokeWidth="12" fill="none" stroke="currentColor" />
                <circle
                  cx="96" cy="96" r="88"
                  className={`transition-all duration-500 ${currentPrediction?.leak_class === 'catastrophic' || currentPrediction?.leak_class === 'major' ? 'text-red-500' :
                    currentPrediction?.leak_class === 'slow' || currentPrediction?.leak_class === 'medium' ? 'text-orange-500' :
                      currentPrediction?.leak_class === 'micro' ? 'text-yellow-500' :
                        currentPrediction?.leak_class === 'none' ? 'text-green-500' :
                          'text-gray-500'
                    }`}
                  strokeWidth="12"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - (currentPrediction?.leak_probability || 0))}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white text-center px-2">
                  {getConfidenceLabel(currentPrediction)}
                </span>
                <span className="text-sm text-gray-400 uppercase tracking-widest mt-1">
                  {currentPrediction?.leak_class === 'slow' ? 'Medium' : (currentPrediction?.leak_class || 'IDLE')}
                </span>
              </div>
            </div>

            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <Badge variant={
                  (currentPrediction?.severity || 'info') === 'critical' ? 'danger' :
                    (currentPrediction?.severity || 'info') === 'high' ? 'warning' : 'success'
                }>
                  {(currentPrediction?.severity || 'Ready').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Action</span>
                <span className="text-white font-medium">{currentPrediction?.recommended_action || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Session Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No alerts generated in this session yet.</div>
          ) : (
            <div className="space-y-4">
              {generatedAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 rounded-lg bg-background-tertiary/30 border border-gray-800 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">SENSOR_001: {alert.message}</h4>
                      <span className="text-sm text-gray-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isStreamModalOpen && <LiveStreamModal />}
    </div>
  )
}

