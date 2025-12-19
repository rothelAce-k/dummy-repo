import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Activity,
    Brain,
    Database,
    AlertTriangle,
    Settings,
    FileText,
    Users,
    ShieldAlert,
    Terminal,
    LogOut,
    Zap
} from 'lucide-react'
import { cn } from '../utils'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Leak Detection', href: '/leak/detect', icon: ShieldAlert },
    { name: 'Sensor Monitor', href: '/sensor/monitor', icon: Zap },
    { name: 'Health Monitoring', href: '/health/monitor', icon: Activity },
    { name: 'System Status', href: '/model/metrics', icon: FileText },
    { name: 'Data Management', href: '/data/manage', icon: Database },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background-secondary/50 px-6 pb-4 border-r border-gray-800 backdrop-blur-xl">
                <div className="flex h-16 shrink-0 items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        LeakGuard AI
                    </span>
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                to={item.href}
                                                className={cn(
                                                    isActive
                                                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5',
                                                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all duration-200'
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white',
                                                        'h-6 w-6 shrink-0 transition-colors duration-200'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                        <li className="mt-auto">
                            <Link
                                to="/logout"
                                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-white" aria-hidden="true" />
                                Logout
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
