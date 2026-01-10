import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Activity, RefreshCw, Zap, Gauge, Thermometer, Shield } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { cn } from '../lib/utils'

import { useSensor } from '../contexts/SensorContext'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Markers using Luminary Vivid Palette
const createCustomIcon = (status, isSelected) => {
  // Using explicit hex for Leaflet because it doesn't support CSS vars easily in SVGs
  const color = status === 'normal' ? '#059669' : // Emerald-600
    status === 'warning' ? '#d97706' : // Amber-600
      status === 'critical' ? '#e11d48' : '#94a3b8'; // Rose-600

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
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

export default function SensorMonitor() {
  const { sensors, isLive, setIsLive, getSensorReading, segmentHealth } = useSensor()
  const [selectedSensor, setSelectedSensor] = useState('all')
  const [readings, setReadings] = useState([])

  // Find current sensor object or default to null if 'all'
  const sensorData = selectedSensor === 'all'
    ? { name: 'Network Overview', location: 'All Zones', status: 'online', lat: 51.508, lng: -0.09 }
    : (sensors.find(s => s.id === selectedSensor) || sensors[0]);

  useEffect(() => {
    setReadings([]);
  }, [selectedSensor]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Fetch reading from context helper
      const newReading = getSensorReading(selectedSensor);
      setReadings(prev => [...prev.slice(-30), newReading]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, selectedSensor, getSensorReading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Sensor Monitor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time telemetry from IoT sensor network</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{isLive ? 'Live Feed' : 'Paused'}</span>
          </div>
          <Button
            variant={isLive ? "secondary" : "primary"}
            onClick={() => setIsLive(!isLive)}
            className="shadow-sm border-slate-200"
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setReadings([])}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* PIPELINE TOPOLOGY MAP (Moved from Field Panel) */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Pipeline Topology Map</h2>

          <div className="relative flex items-center justify-between px-12">
            {/* The Base Line */}
            <div className="absolute left-12 right-12 h-2 bg-slate-100 dark:bg-slate-800 top-1/2 -translate-y-1/2 z-0" />

            {/* Segments & Nodes */}
            {sensors.map((sensor, i) => {
              const isLast = i === sensors.length - 1;
              const reading = getSensorReading(sensor.id);
              const status = sensor.status;

              // Determine color for the segment AFTER this node
              let nextSegmentColor = 'bg-slate-200 dark:bg-slate-700';
              if (!isLast) {
                const nextSensor = sensors[i + 1];
                const segKey = `${sensor.id.split('_')[1]}-${nextSensor.id.split('_')[1]}`;
                const health = segmentHealth[segKey] || 100;
                if (health < 90) nextSegmentColor = 'bg-amber-400';
                if (health < 75) nextSegmentColor = 'bg-rose-500';
              }

              // Flat Status Colors
              const nodeColor = status === 'normal' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500';

              return (
                <div key={sensor.id} className="relative z-10 flex flex-col items-center flex-1">
                  <div className="w-full relative flex items-center justify-center">
                    {/* The Segment Line (Colored Overlay) starting from this node */}
                    {!isLast && (
                      <div className="absolute left-1/2 right-[-50%] h-2 top-1/2 -translate-y-1/2 z-0">
                        <div className={`absolute inset-0 ${nextSegmentColor} transition-colors duration-500`} />
                        {/* Simple Activity Indicator */}
                        {nextSegmentColor === 'bg-amber-400' && (
                          <div className="absolute inset-0 bg-white/30 animate-pulse" />
                        )}
                      </div>
                    )}

                    {/* The Node */}
                    <div className={`relative z-10 w-8 h-8 rounded-full ${nodeColor} border-4 border-white dark:border-slate-900 shadow-sm flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full opacity-50" />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{sensor.name}</div>
                    <div className="font-mono text-xs text-slate-500">{reading.pressure.toFixed(1)} PSI</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="arch-card p-4 bg-white dark:bg-slate-900 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500 mb-2 block">Sensor ID</label>
                <Select value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900">
                  <option value="all">All Sensors</option>
                  {sensors.map(s => (
                    <option key={s.id} value={s.id}>{s.id}</option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Pressure', value: `${readings[readings.length - 1]?.pressure.toFixed(1) || '0.0'} PSI`, color: 'text-blue-600', icon: Gauge },
                  { label: 'Flow Rate', value: `${readings[readings.length - 1]?.flow.toFixed(1) || '0.0'} L/m`, color: 'text-cyan-600', icon: Activity },
                  { label: 'Temperature', value: `${readings[readings.length - 1]?.temp.toFixed(1) || '0.0'} °C`, color: 'text-orange-600', icon: Thermometer },
                  { label: 'H2S Corrosion', value: `${readings[readings.length - 1]?.corrosion.toFixed(4) || '0.000'} mm/y`, color: 'text-rose-600', icon: Shield }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</span>
                    </div>
                    <div className={`text-xl font-bold ${stat.color} dark:text-white`}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Selected Sensor Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Name</span>
                    <span className="text-slate-900 dark:text-white font-medium">{sensorData.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Location</span>
                    <span className="text-slate-900 dark:text-white">{sensorData.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className={`capitalize font-bold ${sensorData.status === 'normal' ? 'text-emerald-600' :
                      sensorData.status === 'warning' ? 'text-amber-600' :
                        sensorData.status === 'online' ? 'text-blue-600' : 'text-rose-600'}`}>
                      {sensorData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="arch-card p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900 border-indigo-100 dark:border-indigo-500/20">
            <div className="text-center">
              <Activity className="h-10 w-10 text-indigo-500 mx-auto mb-3" />
              <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{readings.length > 0 ? readings[readings.length - 1].pressure.toFixed(1) : '--'}</div>
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">Current Pressure (PSI)</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Pressure Chart */}
          <div className="arch-card bg-white dark:bg-slate-900">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedSensor} - Pressure Dynamics</h3>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500/30">PSI</Badge>
            </div>
            <div className="p-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} width={40} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'hsl(var(--card-foreground))' }}
                      labelStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                    />
                    <Line type="monotone" dataKey="pressure" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={false} isAnimationActive={false} />
                    <ReferenceLine y={95} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Flow & Temp Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="arch-card bg-white dark:bg-slate-900 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white">Flow Rate</h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">LPM</Badge>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} width={40} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--card-foreground))' }} />
                    <Line type="monotone" dataKey="flow" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="arch-card bg-white dark:bg-slate-900 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white">Temperature</h3>
                <Badge className="bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400">°C</Badge>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} width={40} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--card-foreground))' }} />
                    <Line type="monotone" dataKey="temp" stroke="hsl(var(--chart-4))" strokeWidth={3} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Geographical Map View */}
          <div className="arch-card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Sensor Network Distribution</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="text-xs text-slate-500">Normal</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> <span className="text-xs text-slate-500">Warning</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> <span className="text-xs text-slate-500">Critical</span></div>
              </div>
            </div>

            {/* Map Container - Light Mode Optimized */}
            <div className="h-[400px] w-full relative z-0 bg-slate-100 dark:bg-slate-900">
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
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {sensors.map(sensor => (
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
                        <h4 className="font-bold text-sm mb-1 text-slate-900">{sensor.name}</h4>
                        <span className="text-xs font-mono block mb-1 text-slate-500">{sensor.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full mb-2 inline-block font-bold ${sensor.status === 'normal' ? 'bg-emerald-100 text-emerald-700' :
                          sensor.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                            sensor.status === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {sensor.status.toUpperCase()}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
