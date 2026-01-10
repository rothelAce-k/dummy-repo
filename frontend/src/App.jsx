import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SensorProvider } from './contexts/SensorContext'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/layout/MainLayout'

// Pages
import Dashboard from './pages/Dashboard'
import SensorMonitor from './pages/SensorMonitor'
import HealthMonitor from './pages/HealthMonitor'
import ModelMetrics from './pages/ModelMetrics' // System Status
import UserManagement from './pages/UserManagement'

const queryClient = new QueryClient()

// Layout Wrapper (No Auth Check)
const LayoutWrapper = ({ children }) => {
    return <MainLayout>{children}</MainLayout>
}

function App() {
    return (
        <Router>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <ThemeProvider>
                        <SensorProvider>
                            <Routes>
                                {/* Public Routes - Presentation Mode Logic Applied */}
                                <Route path="/" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
                                <Route path="/sensor/monitor" element={<LayoutWrapper><SensorMonitor /></LayoutWrapper>} />
                                <Route path="/health/monitor" element={<LayoutWrapper><HealthMonitor /></LayoutWrapper>} />
                                <Route path="/model/metrics" element={<LayoutWrapper><ModelMetrics /></LayoutWrapper>} />
                                <Route path="/users" element={<LayoutWrapper><UserManagement /></LayoutWrapper>} />

                                {/* Catch-all redirect to Dashboard */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                            <Toaster position="top-right" richColors theme="system" />
                        </SensorProvider>
                    </ThemeProvider>
                </AuthProvider>
            </QueryClientProvider>
        </Router>
    )
}

export default App
