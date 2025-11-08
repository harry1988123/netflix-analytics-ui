import React, { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import SearchBar from './components/SearchBar.jsx'
import Filters from './components/Filters.jsx'
import Donut from './components/Donut.jsx'
import Table from './components/Table.jsx'
import Timeline from './components/Timeline.jsx'
import BarChart from './components/BarChart.jsx'
import DayOfWeekChart from './components/DayOfWeekChart.jsx'
import MonthlyChart from './components/MonthlyChart.jsx'
import ComposedChart from './components/ComposedChart.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { usePersistentState } from './hooks/usePersistentState.js'
import { useTheme } from './hooks/useTheme.js'
import { parseUSDate, formatYMD } from './lib/date.js'

function useQueryParams() {
  const get = () => Object.fromEntries(new URLSearchParams(location.search).entries())
  const set = (obj) => {
    const params = new URLSearchParams(obj)
    const url = `${location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', url)
  }
  return [get, set]
}

export default function App() {
  const [raw, setRaw] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme
  useTheme()

  // persistent UI state (also mirrored to URL for shareability)
  const [search, setSearch] = usePersistentState('search', '')
  const [activeTitle, setActiveTitle] = usePersistentState('activeTitle', null)
  const [startDate, setStartDate] = usePersistentState('startDate', '')
  const [endDate, setEndDate] = usePersistentState('endDate', '')
  const [getQuery, setQuery] = useQueryParams()

  // load CSV from public
  useEffect(() => {
    setIsLoading(true)
    Papa.parse('/data/NetflixViewingHistory.csv', {
      header: true,
      download: true,
      dynamicTyping: false,
      complete: ({ data }) => {
        // Normalize dates to YYYY-MM-DD display
        const rows = data.filter(r => r.Title && r.Date).map(r => {
          const dt = parseUSDate(r.Date)
          return { Title: r.Title, Date: formatYMD(dt) }
        })
        // newest first
        rows.sort((a, b) => (a.Date < b.Date ? 1 : -1))
        setRaw(rows)
        setIsLoading(false)
      },
      error: () => {
        setIsLoading(false)
      }
    })
  }, [])

  // Sync local state <-> URL params on first load
  useEffect(() => {
    const qp = getQuery()
    const keys = ['search', 'activeTitle', 'startDate', 'endDate']
    if (keys.some(k => qp[k])) {
      if (qp.search !== undefined) setSearch(qp.search)
      if (qp.activeTitle !== undefined) setActiveTitle(qp.activeTitle || null)
      if (qp.startDate !== undefined) setStartDate(qp.startDate)
      if (qp.endDate !== undefined) setEndDate(qp.endDate)
    } else {
      // seed URL from localStorage
      setQuery({ search, activeTitle: activeTitle ?? '', startDate, endDate })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Anytime filters change, mirror to URL
  useEffect(() => {
    setQuery({ search, activeTitle: activeTitle ?? '', startDate, endDate })
  }, [search, activeTitle, startDate, endDate])

  const filtered = useMemo(() => {

    let rows = raw
    if (startDate) rows = rows.filter(r => r.Date >= startDate)
    if (endDate) rows = rows.filter(r => r.Date <= endDate)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r => r.Title.toLowerCase().includes(q))
    }
    if (activeTitle) {
      rows = rows.filter(r => r.Title === activeTitle)
    }
    return rows
  }, [raw, search, activeTitle, startDate, endDate])

  const topTitles = useMemo(() => {
    const counts = new Map()
    filtered.forEach(r => counts.set(r.Title, (counts.get(r.Title) || 0) + 1))
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
    // Show top 20 titles instead of just 7
    const top = entries.slice(0, 20).map(([name, count]) => ({ name, count }))
    const othersTotal = entries.slice(20).reduce((acc, [, c]) => acc + c, 0)
    if (othersTotal > 0) top.push({ name: 'Others', count: othersTotal })
    return top
  }, [filtered])

  // Process timeline data - group by date and count views per day
  const timelineData = useMemo(() => {
    const dateCounts = new Map()

    filtered.forEach(row => {
      const date = row.Date
      dateCounts.set(date, (dateCounts.get(date) || 0) + 1)
    })

    // Convert to array and sort by date
    const timeline = Array.from(dateCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // If we have too many data points (more than 90 days), group by week
    if (timeline.length > 90) {
      const weeklyData = new Map()
      timeline.forEach(({ date, count }) => {
        const dateObj = new Date(date)
        const weekStart = new Date(dateObj)
        weekStart.setDate(dateObj.getDate() - dateObj.getDay()) // Start of week (Sunday)
        const weekKey = formatYMD(weekStart)

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { date: weekKey, count: 0 })
        }
        weeklyData.get(weekKey).count += count
      })

      return Array.from(weeklyData.values()).sort((a, b) => a.date.localeCompare(b.date))
    }

    return timeline
  }, [filtered])

  // Process day of week data
  const dayOfWeekData = useMemo(() => {
    const dayCounts = new Map()

    filtered.forEach(row => {
      const date = new Date(row.Date)
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
      dayCounts.set(dayOfWeek, (dayCounts.get(dayOfWeek) || 0) + 1)
    })

    return Array.from(dayCounts.entries())
      .map(([dayOfWeek, count]) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        dayOfWeek,
        count
      }))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  }, [filtered])

  // Process monthly data
  const monthlyData = useMemo(() => {
    const monthCounts = new Map()

    filtered.forEach(row => {
      const date = new Date(row.Date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      if (!monthCounts.has(monthKey)) {
        monthCounts.set(monthKey, { month: monthLabel, monthKey, count: 0 })
      }
      monthCounts.get(monthKey).count += 1
    })

    return Array.from(monthCounts.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
  }, [filtered])

  // Process data for composed chart (top 10 titles with average line)
  const composedChartData = useMemo(() => {
    const counts = new Map()
    filtered.forEach(r => counts.set(r.Title, (counts.get(r.Title) || 0) + 1))
    const entries = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    return entries
  }, [filtered])

  // Top 10 titles for bar chart
  const top10Titles = useMemo(() => {
    const counts = new Map()
    filtered.forEach(r => counts.set(r.Title, (counts.get(r.Title) || 0) + 1))
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }, [filtered])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <ThemeToggle />
        <header className="flex flex-col sm:flex-row gap-2 sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Netflix Viewing Explorer</h1>
            <p className="text-muted-foreground text-sm">Filters persist across refresh. Click a donut slice or use search to filter the table.</p>
          </div>
        </header>

        <SearchBar value={search} onChange={setSearch} />
        <Filters
          startDate={startDate}
          endDate={endDate}
          onStart={setStartDate}
          onEnd={setEndDate}
          hasActiveFilters={search || startDate || endDate || activeTitle}
          onClearAll={() => {
            setSearch('')
            setStartDate('')
            setEndDate('')
            setActiveTitle(null)
          }}
        />

        <Timeline data={timelineData} title="Viewing Activity Over Time" isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <BarChart data={top10Titles} title="Top 10 Titles (Bar Chart)" isLoading={isLoading} />
          <DayOfWeekChart data={dayOfWeekData} title="Viewing by Day of Week" isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <MonthlyChart data={monthlyData} title="Viewing by Month" isLoading={isLoading} />
          <ComposedChart data={composedChartData} title="Top 10 Titles with Average" isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <div className="lg:col-span-1">
            <Donut
              data={topTitles}
              activeKey={activeTitle}
              onSliceClick={(name) => {
                if (name === 'Others') return
                setActiveTitle(prev => prev === name ? null : name)
              }}
              title="Top titles in results"
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <Table rows={filtered} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
