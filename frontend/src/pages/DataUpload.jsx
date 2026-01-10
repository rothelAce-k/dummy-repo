import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Upload, Database, FileText, Trash2, Eye, Plus, Archive } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataApi } from '../lib/api'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function DataUpload() {
  const [file, setFile] = useState(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => dataApi.getAll().then(res => res.data),
    initialData: []
  })

  const uploadMutation = useMutation({
    mutationFn: (formData) => dataApi.upload(formData),
    onSuccess: () => {
      toast.success('Dataset uploaded successfully')
      setFile(null)
      queryClient.invalidateQueries(['datasets'])
    },
    onError: () => {
      toast.error('Upload failed')
    }
  })

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    uploadMutation.mutate(formData)
  }

  const handleDelete = async (id) => {
    try {
      await dataApi.deleteDataset(id)
      toast.success('Dataset deleted')
      queryClient.invalidateQueries(['datasets'])
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Data Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Upload and manage training datasets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="arch-card lg:col-span-1 bg-white dark:bg-slate-900 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload New Dataset</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Supported formats: CSV, JSON</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative bg-slate-50 dark:bg-slate-800/50">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".csv,.json"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {file ? file.name : "Drag & drop or click to select"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Max file size: 50MB</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed shadow-none border-0"
              disabled={true}
              onClick={() => toast.error("Uploads are temporarily disabled by the administrator.")}
              isLoading={false}
            >
              Uploads Paused (Maintenance)
            </Button>
          </div>
        </div>

        {/* Dataset List */}
        <div className="arch-card lg:col-span-2 bg-white dark:bg-slate-900 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Available Datasets</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your data assets</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {datasets && datasets.length > 0 ? (
                datasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{dataset.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" /> {dataset.row_count || 0} rows
                          </span>
                          <span>•</span>
                          <span>{dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : 'Unknown date'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200" onClick={() => handleDelete(dataset.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                    <Archive className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p>No datasets found. Upload one to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
