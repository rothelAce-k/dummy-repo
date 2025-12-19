import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { AlertTriangle, Bell, Check, Trash2, Filter, FileText, Activity, Send } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { leakApi } from '../lib/api'
import toast from 'react-hot-toast'

const InvestigationModal = ({ alert, onClose }) => {
  const [reportNote, setReportNote] = useState('')

  const handleSubmit = () => {
    toast.success("Investigation report filed successfully")
    onClose()
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-screen z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-[#0f172a] border border-gray-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Investigation Console</h2>
              <p className="text-sm text-gray-400">Incident ID: #{alert.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Incident Details</h3>
            <div className="bg-background-tertiary/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sensor ID</span>
                <span className="text-white font-mono">SENSOR_001</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Type</span>
                <span className="text-white">{alert.leak_class === 'slow' ? 'Medium' : alert.leak_class}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Severity</span>
                <span className={`capitalize ${alert.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>{alert.severity}</span>
              </div>

            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">File Report</h3>
            <div className="flex flex-col h-full gap-3">
              <textarea
                className="w-full h-32 bg-background-tertiary/30 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                placeholder="Enter field notes, visual observations, or maintenance actions taken..."
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
              />
              <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Send className="w-4 h-4 mr-2" /> Submit Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Alerts() {
  const queryClient = useQueryClient()
  const [selectedAlert, setSelectedAlert] = useState(null)

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => leakApi.getAlerts(50, true).then(res => res.data),
    initialData: []
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Alerts</h1>
          <p className="text-gray-400">Manage critical incidents and warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <Check className="mr-2 h-4 w-4" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500 hover:border-l-red-400 transition-all">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`p-3 rounded-full ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                    'bg-orange-500/20 text-orange-500'
                    }`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-lg">
                        {alert.message.split(' (Conf:')[0]}
                      </h4>
                      <span className="text-sm text-gray-500">{new Date(alert.created_at || alert.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      Sensor ID: <span className="text-gray-300 font-mono">SENSOR_001</span> • Status: <span className="capitalize">{alert.leak_class === 'slow' ? 'Medium' : alert.leak_class}</span>
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <Button size="sm" variant="primary" onClick={() => setSelectedAlert(alert)}>Investigate</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await leakApi.acknowledgeAlert(alert.id);
                            queryClient.invalidateQueries({ queryKey: ['alerts'] });
                          } catch (e) {
                            console.error(e)
                          }
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-background-tertiary/30 border-dashed border-2 border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">No Active Alerts</h3>
                <p className="text-gray-400 max-w-sm mt-2">
                  System is running smoothly. No anomalies detected in the monitored pipeline.
                </p>
              </CardContent>
            </Card>
          )}
        </div>


      </div>

      {selectedAlert && <InvestigationModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
    </div>
  )
}
