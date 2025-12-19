import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    })

                    const { access_token, refresh_token } = response.data
                    localStorage.setItem('access_token', access_token)
                    localStorage.setItem('refresh_token', refresh_token)

                    originalRequest.headers.Authorization = `Bearer ${access_token}`
                    return api(originalRequest)
                } catch (refreshError) {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    window.location.href = '/login'
                }
            } else {
                window.location.href = '/login'
            }
        }

        let message = error.response?.data?.detail || 'An error occurred'

        // Handle Pydantic validation errors (array or single object)
        if (typeof message === 'object' && message !== null) {
            if (Array.isArray(message)) {
                message = message.map(err => err.msg || JSON.stringify(err)).join(', ')
            } else {
                // Flatten single error object
                message = message.msg || JSON.stringify(message)
            }
        }

        toast.error(message)

        return Promise.reject(error)
    }
)

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (email, username, password) => api.post('/auth/register', { email, username, password }),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
}

export const dataApi = {
    generate: (config) => api.post('/data/generate', config),
    getSchema: () => api.get('/data/schema'),
    getSummary: (datasetId) => api.get(`/data/summary/${datasetId}`),
    upload: (data) => {
        return api.post('/data/upload', data, {
            headers: {
                'Content-Type': null
            }
        })
    },
    listDatasets: () => api.get('/data/datasets'),
    getAll: () => api.get('/data/datasets'),
    getDataset: (id) => api.get(`/data/datasets/${id}`),
    deleteDataset: (id) => api.delete(`/data/datasets/${id}`),
    previewDataset: (id, rows = 100) => api.get(`/data/datasets/${id}/preview?rows=${rows}`),
    downloadDataset: (id) => api.get(`/data/datasets/${id}/download`, { responseType: 'blob' }),
}

export const modelApi = {
    // Legacy support for Dashboard and ModelMetrics page
    getMetrics: () => api.get('/leak/model'),
}

export const leakApi = {
    stream: (data) => api.post('/leak/stream', data),
    getAlerts: (limit = 50, unacknowledgedOnly = false) =>
        api.get(`/leak/alerts?limit=${limit}&unacknowledged_only=${unacknowledgedOnly}`),
    acknowledgeAlert: (alertId) => api.post(`/leak/alerts/${alertId}/acknowledge`),
    getTimeline: (hours = 24) => api.get(`/leak/timeline?hours=${hours}`),
    getStats: () => api.get('/leak/stats'),
    batchPredict: (data) => api.post('/leak/batch-predict', data),
}

export const adminApi = {
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getStats: () => api.get('/admin/stats'),
    getDashboard: () => api.get('/admin/dashboard'),
    getLogs: (limit = 100, level = null) => {
        let url = `/admin/logs?limit=${limit}`
        if (level) url += `&level=${level}`
        return api.get(url)
    },
}

export default api
