import React, { useState } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { AlertTriangle, Bell, Check, Filter, FileText, Send } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { leakApi } from '../lib/api'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

const InvestigationModal = ({ alert, onClose }) => {
  const [reportNote, setReportNote] = useState('')

  const handleSubmit = () => {
    toast.success("Investigation report filed successfully")
    onClose()
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-screen z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Investigation Console</h2>
              <p className="text-sm text-slate-500">Incident ID: #{alert.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Incident Details</h3>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3 border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sensor ID</span>
                <span className="text-slate-900 dark:text-white font-mono">SENSOR_001</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-900 dark:text-white font-medium">{alert.leak_class === 'slow' ? 'Medium' : alert.leak_class}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Severity</span>
                <span className={`capitalize font-bold ${alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'}`}>{alert.severity}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">File Report</h3>
            <div className="flex flex-col h-full gap-3">
              <textarea
                className="w-full h-32 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter field notes, visual observations, or maintenance actions taken..."
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
              />
              <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Alerts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage critical incidents and warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm">
            <Check className="mr-2 h-4 w-4" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <div className="p-5 flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${alert.severity === 'critical'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                        {alert.message.split(' (Conf:')[0]}
                      </h4>
                      <span className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {new Date(alert.created_at || alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Sensor:</span> SENSOR_001
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
                      <span className="capitalize">{alert.leak_class === 'slow' ? 'Medium' : alert.leak_class}</span>
                    </p>

                    <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => setSelectedAlert(alert)}>
                        Investigate Action
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
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
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Active Alerts</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                System is running smoothly. No anomalies detected in the monitored pipeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedAlert && <InvestigationModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
    </div>
  )
}
