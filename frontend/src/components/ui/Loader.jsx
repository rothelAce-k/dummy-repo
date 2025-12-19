import React from 'react'
import { cn } from '../utils'

export function Loader({ className, size = "md" }) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4",
    }

    return (
        <div className={cn("relative", className)}>
            <div className={cn(
                "animate-spin rounded-full border-gray-700 border-t-primary",
                sizes[size]
            )} />
            <div className={cn(
                "absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl",
                sizes[size]
            )} />
        </div>
    )
}
