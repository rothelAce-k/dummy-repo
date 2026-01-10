import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Activity,
    FileText,
    Users,
    Zap,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react'
import { cn } from '../../lib/utils'

// PRESENTATION MODE: Only showing requested dashboards
const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sensor Monitor', href: '/sensor/monitor', icon: Zap },
    { name: 'Health Monitoring', href: '/health/monitor', icon: Activity },
    { name: 'System Status', href: '/model/metrics', icon: FileText },
    { name: 'User Management', href: '/users', icon: Users },
]

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const location = useLocation()

    return (
        <>
            {/* Mobile Sidebar Overlay & Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm lg:hidden"
                        />

                        {/* Slide-in Sidebar */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl lg:hidden flex flex-col border-r border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex h-auto py-5 shrink-0 items-start justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <Activity className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                            AIPIS
                                        </span>
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                            Adaptive Intelligent
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                            Pipeline Integrity System
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    className="-m-2.5 p-2.5 text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            <nav className="flex flex-1 flex-col px-4 py-4 overflow-y-auto">
                                <ul role="list" className="flex flex-1 flex-col gap-y-1">
                                    {navigation.map((item) => {
                                        const isActive = location.pathname === item.href
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={cn(
                                                        "group flex gap-x-3 rounded-lg p-2.5 text-base font-semibold transition-all duration-200",
                                                        isActive
                                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                                    )}
                                                >
                                                    <item.icon
                                                        className={cn(
                                                            "h-6 w-6 shrink-0 transition-colors",
                                                            isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: collapsed ? 80 : 256 }}
                className={cn(
                    "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
                    "bg-white dark:bg-slate-900",
                    "border-r border-slate-200 dark:border-slate-800",
                    "transition-all duration-300 ease-in-out"
                )}
            >
                <div className="flex grow flex-col gap-y-5 overflow-y-auto px-4 pb-4">
                    {/* Header Logo */}
                    <div className={cn("flex flex-col shrink-0 mt-5 mb-2 overflow-hidden", collapsed ? "items-center" : "items-start px-2")}>

                        <div className={cn("flex items-center justify-between w-full", collapsed && "justify-center")}>
                            {/* Logo Row */}
                            <div className="flex items-center gap-3">
                                <motion.div
                                    layoutId="sidebar-logo"
                                    className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0"
                                >
                                    <Activity className="h-6 w-6 text-white" />
                                </motion.div>

                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap"
                                        >
                                            AIPIS
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            {!collapsed && (
                                <button
                                    onClick={() => setCollapsed(!collapsed)}
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                        </div>

                        {/* Full Form Subtitle - Animated */}
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="overflow-hidden w-full"
                                >
                                    <div className="flex flex-col leading-tight mt-3 pl-0.5 select-none text-left">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                            Adaptive Intelligent
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                            Pipeline Integrity System
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Collapsed Expand Button */}
                        {collapsed && (
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="mt-4 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>

                    <nav className="flex flex-1 flex-col mt-2">
                        <ul role="list" className="flex flex-1 flex-col gap-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href
                                return (
                                    <li key={item.name}>
                                        <Link
                                            to={item.href}
                                            className={cn(
                                                "relative group flex items-center gap-x-3 rounded-lg p-2.5 text-sm font-semibold transition-all duration-200",
                                                collapsed ? "justify-center" : "",
                                                isActive
                                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                                            )}

                                            <item.icon
                                                className={cn(
                                                    "h-5 w-5 shrink-0 transition-colors",
                                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                                )}
                                                aria-hidden="true"
                                            />
                                            {!collapsed && (
                                                <span className="truncate">{item.name}</span>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </div>
            </motion.div>
        </>
    )
}
