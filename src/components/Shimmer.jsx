import React from 'react'

// Shimmer effect component for loading states
export default function Shimmer({ height = 'h-80', className = '' }) {
    return (
        <div className={`animate-pulse ${className}`}>
            <div className="space-y-4">
                {/* Title shimmer */}
                <div className="h-6 bg-muted rounded w-1/3"></div>

                {/* Content shimmer */}
                <div className={`${height} bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg relative overflow-hidden`}>
                    <div className="absolute inset-0 -translate-x-full shimmer-animate bg-gradient-to-r from-transparent via-background/60 to-transparent"></div>
                </div>
            </div>
        </div>
    )
}

// Shimmer for table rows
export function TableShimmer({ rows = 10 }) {
    return (
        <div className="animate-pulse">
            {/* Header shimmer */}
            <div className="bg-muted border-b border-border">
                <div className="flex">
                    <div className="h-12 bg-muted-foreground/20 rounded w-32 m-2"></div>
                    <div className="h-12 bg-muted-foreground/20 rounded flex-1 m-2"></div>
                </div>
            </div>

            {/* Row shimmers */}
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex border-b border-border">
                    <div className="h-10 bg-muted/50 w-32 m-2 rounded"></div>
                    <div className="h-10 bg-muted/50 flex-1 m-2 rounded"></div>
                </div>
            ))}
        </div>
    )
}

// Shimmer for donut chart
export function DonutShimmer() {
    return (
        <div className="animate-pulse">
            <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-[600px] bg-gradient-to-r from-muted via-muted/50 to-muted rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full shimmer-animate bg-gradient-to-r from-transparent via-background/60 to-transparent"></div>
                </div>
            </div>
        </div>
    )
}

