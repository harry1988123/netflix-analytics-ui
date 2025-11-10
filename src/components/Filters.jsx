import React from 'react'
import DatePicker from './DatePicker.jsx'
import QuickFilters from './QuickFilters.jsx'
import { Button } from './ui/button.jsx'
import { Card } from './ui/card.jsx'

export default function Filters({ startDate, endDate, onStart, onEnd, onClearAll, hasActiveFilters }) {
  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <QuickFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStart}
            onEndDateChange={onEnd}
          />
          {hasActiveFilters && onClearAll && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClearAll}
              className="whitespace-nowrap"
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
                className="mr-1.5"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear All
            </Button>
          )}
        </div>
      </Card>
      <Card className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </Card>
    </div>
  )
}
