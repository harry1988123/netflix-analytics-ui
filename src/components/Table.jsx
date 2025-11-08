import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TableShimmer } from './Shimmer.jsx'

const ROW_HEIGHT = 40 // Height of each row in pixels
const CONTAINER_HEIGHT = 600 // Total height of the virtualized container

export default function Table({ rows = [], isLoading = false }) {
  const parentRef = useRef(null)

  // Ensure rows is always an array
  const safeRows = Array.isArray(rows) ? rows : []

  const rowVirtualizer = useVirtualizer({
    count: safeRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  if (isLoading) {
    return (
      <div className="card p-0 overflow-hidden">
        <TableShimmer rows={15} />
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted border-b border-border sticky top-0 z-10">
        <div className="flex">
          <div className="text-left px-4 py-3 font-semibold flex-shrink-0 w-32 text-foreground">Date</div>
          <div className="text-left px-4 py-3 font-semibold flex-1 text-foreground">Title</div>
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${Math.min(CONTAINER_HEIGHT, safeRows.length * ROW_HEIGHT)}px` }}
      >
        {safeRows.length === 0 ? (
          <div className="px-4 py-6 text-center text-muted-foreground">No results</div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = safeRows[virtualRow.index]
              if (!row) return null

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    className={`flex border-b border-border transition-colors hover:bg-accent ${virtualRow.index % 2 ? 'bg-muted/50' : 'bg-card'
                      }`}
                  >
                    <div className="px-4 py-2 whitespace-nowrap flex-shrink-0 w-32 font-medium">
                      {row.Date || ''}
                    </div>
                    <div className="px-4 py-2 flex-1">{row.Title || ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
