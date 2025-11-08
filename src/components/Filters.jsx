import React from 'react'
import DatePicker from './DatePicker.jsx'
import QuickFilters from './QuickFilters.jsx'

export default function Filters({ startDate, endDate, onStart, onEnd, onClearAll, hasActiveFilters }) {
  return (
    <div className="space-y-3">
      <div className="card p-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <QuickFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStart}
            onEndDateChange={onEnd}
          />
          {hasActiveFilters && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>
      <div className="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Start date</label>
          <DatePicker
            value={startDate}
            onChange={onStart}
            placeholder="Select start date"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">End date</label>
          <DatePicker
            value={endDate}
            onChange={onEnd}
            placeholder="Select end date"
          />
        </div>
      </div>
    </div>
  )
}
