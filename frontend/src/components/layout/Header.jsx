import React from 'react'
import { Menu, Cpu, ShieldCheck } from 'lucide-react'
import { useSensor } from '../../contexts/SensorContext'
import ThemeToggle from '../ThemeToggle'
import { cn } from '../../lib/utils'

export function Header({ sidebarOpen, setSidebarOpen }) {
    const { isLive, isDiagnosing } = useSensor()

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-6 transition-all duration-300 pointer-events-none">
            {/* Mobile Menu Button - Pointer Events ON */}
            <button
                type="button"
                className="pointer-events-auto -m-2.5 p-2.5 text-slate-500 lg:hidden hover:text-indigo-600 transition-colors"
                onClick={() => setSidebarOpen(true)}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Spacer for Flex Alignment (if needed) */}
            <div className="lg:hidden" />

            {/* Floating Glass Control Bar - Centered/Right Aligned Contextually */}
            <div className={cn(
                "pointer-events-auto ml-auto flex items-center gap-4 px-4 py-2 rounded-full",
                "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm",
                "border border-white/20 dark:border-white/5",
                "transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-900/80 hover:shadow-md hover:scale-[1.01]"
            )}>

                {/* Status Indicator Group */}
                <div className="flex items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-4 mr-1">

                    {/* Primary Status */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                            {isLive || isDiagnosing ? (
                                <span className={cn(
                                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                    isDiagnosing ? "bg-amber-400" : "bg-rose-400"
                                )}></span>
                            ) : null}
                            <span className={cn(
                                "relative inline-flex rounded-full h-2 w-2",
                                isDiagnosing ? "bg-amber-500" : isLive ? "bg-rose-500" : "bg-slate-400"
                            )}></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                            {isDiagnosing ? "Diagnostics" : isLive ? "Live" : "Paused"}
                        </span>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="flex items-center gap-1.5 opacity-60">
                            <Cpu className={cn("h-3 w-3", isDiagnosing ? "text-amber-500" : "text-indigo-500")} />
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {isDiagnosing ? "Verifying..." : "Online"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                Secure
                            </span>
                        </div>
                    </div>
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />
            </div>
        </header>
    )
}
