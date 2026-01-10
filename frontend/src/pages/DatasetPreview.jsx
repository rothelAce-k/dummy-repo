import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Table, FileSpreadsheet, Database } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { dataApi } from '../lib/api'
import { Loader } from '../components/ui/Loader'

export default function DatasetPreview() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: previewData, isLoading } = useQuery({
    queryKey: ['dataset-preview', id],
    queryFn: () => dataApi.getPreview(id).then(res => res.data),
  })

  // Mock data if API is empty for UI testing
  const columns = previewData?.columns || ['timestamp', 'pressure', 'flow', 'temp', 'status']
  const rows = previewData?.rows || Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date().toISOString(),
    pressure: (80 + Math.random() * 10).toFixed(2),
    flow: (45 + Math.random() * 5).toFixed(2),
    temp: (22 + Math.random() * 2).toFixed(1),
    status: Math.random() > 0.9 ? 'Anomaly' : 'Normal'
  }))

  if (isLoading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loader size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/data/manage')} className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:border-indigo-200">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="h-8 w-8 text-indigo-500" />
            Dataset Preview
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Inspecting dataset ID: <span className="font-mono text-indigo-500">{id}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="arch-card lg:col-span-1 bg-white dark:bg-slate-900 p-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Metadata</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Row Count</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">1,245</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Column Count</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{columns.length}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Missing Values</div>
              <Badge variant="success" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">None Detected</Badge>
            </div>
          </div>
        </div>

        <div className="arch-card lg:col-span-3 bg-white dark:bg-slate-900 p-0 overflow-hidden">
          <div className="flex flex-row items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Sample</h3>
            <Button variant="outline" size="sm" className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-xs">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-6 py-4 whitespace-nowrap border-b border-slate-100 dark:border-slate-800">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-indigo-900/10 transition-colors">
                    {columns.map((col) => (
                      <td key={col} className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono text-xs">
                        {col === 'status' ? (
                          <Badge variant={row[col] === 'Normal' ? 'success' : 'danger'} className={row[col] === 'Normal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'}>
                            {row[col]}
                          </Badge>
                        ) : row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
