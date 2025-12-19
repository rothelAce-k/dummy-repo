import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Upload, Database, FileText, Trash2, Eye, Plus } from 'lucide-react'
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
          <h1 className="text-3xl font-bold text-white">Data Management</h1>
          <p className="text-gray-400">Upload and manage training datasets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-background-secondary to-blue-900/10 border-blue-500/10">
          <CardHeader>
            <CardTitle>Upload New Dataset</CardTitle>
            <CardDescription>Supported formats: CSV, JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer relative bg-black/20">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".csv,.json"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {file ? file.name : "Drag & drop or click not select"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max file size: 50MB</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full opacity-70 cursor-not-allowed"
              disabled={true}
              onClick={() => toast.error("Uploads are temporarily disabled by the administrator.")}
              isLoading={false}
            >
              Uploads Paused (Maintenance)
            </Button>
          </CardContent>
        </Card>

        {/* Dataset List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Datasets</CardTitle>
            <CardDescription>Manage your data assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {datasets && datasets.length > 0 ? (
                datasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/50 border border-gray-800 hover:border-gray-700 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{dataset.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" /> {dataset.row_count || 0} rows
                          </span>
                          <span>•</span>
                          <span>{dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : 'Unknown date'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                      <Button variant="danger" size="icon" className="h-9 w-9" onClick={() => handleDelete(dataset.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No datasets found. Upload one to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
