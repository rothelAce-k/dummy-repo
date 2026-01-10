import React from 'react'
import { cn } from '../../lib/utils'

export function GlassCard({ children, className, ...props }) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border transition-all duration-200",
                // Light Mode: Solid White, Subtle Shadow
                "bg-white border-slate-200 shadow-sm",
                // Dark Mode: Keep subtle glass for depth
                "dark:bg-white/5 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-none",
                className
            )}
            {...props}
        >
            <div className="relative z-10 p-6">
                {children}
            </div>
        </div>
    )
}
