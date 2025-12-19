import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Table, FileSpreadsheet } from 'lucide-react'
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/data/manage')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Dataset Preview</h1>
          <p className="text-gray-400">Inspecting dataset ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Row Count</div>
              <div className="text-xl font-bold text-white">1,245</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Column Count</div>
              <div className="text-xl font-bold text-white">{columns.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Missing Values</div>
              <Badge variant="success">None Detected</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Data Sample</CardTitle>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-background-tertiary text-gray-400 uppercase font-medium">
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="px-6 py-4 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        {columns.map((col) => (
                          <td key={col} className="px-6 py-4 text-gray-300 whitespace-nowrap">
                            {col === 'status' ? (
                              <Badge variant={row[col] === 'Normal' ? 'success' : 'danger'}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
