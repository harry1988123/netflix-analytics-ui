import React from 'react'
import { format, subMonths, subYears, startOfDay, max as maxDate } from 'date-fns'

// Minimum date allowed: 2019-11-16
const MIN_DATE = new Date(2019, 10, 16)

export default function QuickFilters({ onStartDateChange, onEndDateChange, startDate, endDate }) {
  const today = startOfDay(new Date())

  const quickFilters = [
    {
      label: 'Last 3 Months',
      getDates: () => {
        const calculatedStart = startOfDay(subMonths(today, 3))
        // Ensure start date is not before minimum date (2019-11-16)
        const start = maxDate([calculatedStart, MIN_DATE])
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        }
      }
    },
    {
      label: 'Last 6 Months',
      getDates: () => {
        const calculatedStart = startOfDay(subMonths(today, 6))
        // Ensure start date is not before minimum date (2019-11-16)
        const start = maxDate([calculatedStart, MIN_DATE])
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        }
      }
    },
    {
      label: 'Last 1 Year',
      getDates: () => {
        const calculatedStart = startOfDay(subYears(today, 1))
        // Ensure start date is not before minimum date (2019-11-16)
        const start = maxDate([calculatedStart, MIN_DATE])
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        }
      }
    }
  ]

  const handleQuickFilter = (filter) => {
    const dates = filter.getDates()
    onStartDateChange(dates.start)
    onEndDateChange(dates.end)
  }

  const isActive = (filter) => {
    if (!startDate || !endDate) return false
    const dates = filter.getDates()
    // Compare dates directly - getDates() already handles the min date clamping
    return startDate === dates.start && endDate === dates.end
  }

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => {
        const active = isActive(filter)
        return (
          <button
            key={filter.label}
            type="button"
            onClick={() => handleQuickFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${active
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

