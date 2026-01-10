import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Activity, RefreshCw, AlertTriangle, Zap } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to center map on selection
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Custom colored markers
const createCustomIcon = (status, isSelected) => {
  const color = status === 'normal' ? '#22c55e' :
    status === 'warning' ? '#eab308' :
      status === 'critical' ? '#ef4444' : '#9ca3af';

  const size = isSelected ? 24 : 16;
  const border = isSelected ? '4px solid white' : '2px solid white';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: ${border}; 
      box-shadow: 0 0 10px ${isSelected ? color : 'transparent'};
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const SENSORS = [
  { id: 'SENSOR_001', lat: 51.505, lng: -0.09, status: 'normal', name: 'Main Pump A', location: 'Zone 1' },
  { id: 'SENSOR_002', lat: 51.51, lng: -0.1, status: 'warning', name: 'Valve Station B', location: 'Zone 2' },
  { id: 'SENSOR_003', lat: 51.51, lng: -0.12, status: 'critical', name: 'Pressure Node C', location: 'Zone 2' },
  { id: 'SENSOR_004', lat: 51.505, lng: -0.13, status: 'normal', name: 'Flow Meter D', location: 'Zone 3' },
  { id: 'SENSOR_005', lat: 51.49, lng: -0.08, status: 'offline', name: 'Safety Valve E', location: 'Zone 1' },
];

export default function SensorMonitor() {
  const [selectedSensor, setSelectedSensor] = useState('all')
  const [readings, setReadings] = useState([])
  const [isLive, setIsLive] = useState(true)

  // Find current sensor object or default to null if 'all'
  const sensorData = selectedSensor === 'all'
    ? { name: 'Network Overview', location: 'All Zones', status: 'online', lat: 51.505, lng: -0.09 }
    : (SENSORS.find(s => s.id === selectedSensor) || SENSORS[0]);

  // Mock live data - simulated different profiles based on sensor ID
  useEffect(() => {
    // Reset reading when sensor changes to avoid jump
    setReadings([]);
  }, [selectedSensor]);

  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString()

      let basePressure = 80;
      let baseFlow = 45;
      let idNum = 0;

      if (selectedSensor !== 'all') {
        idNum = parseInt(selectedSensor.split('_')[1] || 1);
        basePressure = 80 + (idNum * 5);
        baseFlow = 40 + (idNum * 2);
      }

      const newReading = {
        time: timeStr,
        pressure: basePressure + (Math.random() * 5 - 2.5),
        flow: baseFlow + (Math.random() * 4 - 2),
        temp: 20 + (idNum * 1.5) + Math.random(),
        vibration: Math.random() * ((idNum || 1) * 0.2)
      }
      setReadings(prev => [...prev.slice(-30), newReading])
    }, 1000)
    return () => clearInterval(interval)
  }, [isLive, selectedSensor])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Sensor Monitor
          </h1>
          <p className="text-gray-400 mt-1">Real-time telemetry from IoT sensor network</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className="text-sm font-medium text-gray-300">{isLive ? 'Live Feed' : 'Paused'}</span>
          </div>
          <Button
            variant={isLive ? "secondary" : "primary"}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setReadings([])}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Sensor ID</label>
                <Select value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
                  <option value="all">All Sensors</option>
                  {SENSORS.map(s => (
                    <option key={s.id} value={s.id}>{s.id}</option>
                  ))}
                </Select>
              </div>
              <div className="p-4 rounded-lg bg-background-tertiary">
                <h4 className="text-sm font-semibold text-white mb-3">Selected Sensor Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Name</span>
                    <span className="text-white font-mono">{sensorData.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white">{sensorData.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={`capitalize ${sensorData.status === 'normal' ? 'text-green-500' :
                      sensorData.status === 'warning' ? 'text-yellow-500' :
                        sensorData.status === 'online' ? 'text-blue-500' : 'text-red-500'}`}>
                      {sensorData.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Activity className="h-10 w-10 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{readings.length > 0 ? readings[readings.length - 1].pressure.toFixed(1) : '--'}</div>
              <div className="text-sm text-blue-200">Current Pressure (PSI)</div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Pressure Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedSensor} - Pressure Dynamics</CardTitle>
                <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/20">PSI</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="#9ca3af" width={40} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                      labelStyle={{ fontSize: '12px', color: '#9ca3af' }}
                    />
                    <Line type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <ReferenceLine y={95} stroke="#ef4444" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Flow & Temp Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Flow Rate</CardTitle>
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">LPM</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} stroke="#9ca3af" width={40} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                      <Line type="monotone" dataKey="flow" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Temperature</CardTitle>
                  <Badge variant="default" className="bg-amber-500/10 text-amber-400 border-amber-500/20">°C</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} stroke="#9ca3af" width={40} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                      <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographical Map View */}
          <Card className="overflow-hidden border-gray-800 bg-background-secondary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sensor Network Distribution</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> <span className="text-xs text-gray-400">Normal</span>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div> <span className="text-xs text-gray-400">Warning</span>
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> <span className="text-xs text-gray-400">Critical</span>
                </div>
              </div>
            </CardHeader>
            <div className="h-[400px] w-full bg-[#0f172a] relative z-0">
              <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <MapUpdater center={[sensorData.lat, sensorData.lng]} zoom={selectedSensor === 'all' ? 13 : 15} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {SENSORS.map(sensor => (
                  <Marker
                    key={sensor.id}
                    position={[sensor.lat, sensor.lng]}
                    icon={createCustomIcon(sensor.status, sensor.id === selectedSensor)}
                    eventHandlers={{
                      click: () => {
                        setSelectedSensor(sensor.id);
                      }
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <h4 className="font-bold text-sm mb-1">{sensor.name}</h4>
                        <span className="text-xs font-mono block mb-1">{sensor.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full mb-2 inline-block ${sensor.status === 'normal' ? 'bg-green-500/20 text-green-400' :
                          sensor.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            sensor.status === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                          {sensor.status.toUpperCase()}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
