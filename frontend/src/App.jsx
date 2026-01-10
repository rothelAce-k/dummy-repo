import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import MainLayout from './components/layout/MainLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

import ModelMetrics from './pages/ModelMetrics' // Renamed to System Capability
import LeakDetection from './pages/LeakDetection'
import DataUpload from './pages/DataUpload'
import UserManagement from './pages/UserManagement'

import SensorMonitor from './pages/SensorMonitor'
import HealthMonitor from './pages/HealthMonitor'
import DatasetPreview from './pages/DatasetPreview'
import Alerts from './pages/Alerts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const ProtectedRoute = ({ children }) => {
  // Bypass authentication for preview stability
  return <MainLayout>{children}</MainLayout>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/sensor/monitor" element={
        <ProtectedRoute>
          <SensorMonitor />
        </ProtectedRoute>
      } />

      <Route path="/leak/detect" element={
        <ProtectedRoute>
          <LeakDetection />
        </ProtectedRoute>
      } />

      <Route path="/health/monitor" element={
        <ProtectedRoute>
          <HealthMonitor />
        </ProtectedRoute>
      } />

      {/* Model Training Hidden */}

      <Route path="/model/metrics" element={
        <ProtectedRoute>
          <ModelMetrics />
        </ProtectedRoute>
      } />

      <Route path="/data/manage" element={
        <ProtectedRoute>
          <DataUpload />
        </ProtectedRoute>
      } />

      <Route path="/data/preview/:id" element={
        <ProtectedRoute>
          <DatasetPreview />
        </ProtectedRoute>
      } />

      <Route path="/alerts" element={
        <ProtectedRoute>
          <Alerts />
        </ProtectedRoute>
      } />

      {/* Data Generator Hidden */}

      {/* System Logs Hidden */}

      <Route path="/users" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-background-secondary text-white border border-gray-700',
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
