import React from 'react'
import { cn } from '../utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-lg border border-gray-700 bg-background-tertiary/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:bg-background-secondary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
