import React, { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import SearchBar from './components/SearchBar.jsx'
import Filters from './components/Filters.jsx'
import ProfileSelector from './components/ProfileSelector.jsx'
import Donut from './components/Donut.jsx'
import Table from './components/Table.jsx'
import Timeline from './components/Timeline.jsx'
import BarChart from './components/BarChart.jsx'
import DayOfWeekChart from './components/DayOfWeekChart.jsx'
import MonthlyChart from './components/MonthlyChart.jsx'
import ComposedChart from './components/ComposedChart.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import InsightsDialog from './components/InsightsDialog.jsx'
import { usePersistentState } from './hooks/usePersistentState.js'
import { useTheme } from './hooks/useTheme.js'
import { parseUSDate, formatYMD } from './lib/date.js'

// Extract main title from episode titles
// Examples: "Naruto Shippuden: Episode 1" -> "Naruto Shippuden"
//           "The Vampire Diaries: Season 1: Episode 5" -> "The Vampire Diaries"
//           "C.I.D: Episodes (76-104): 09-11-2025 Industrialist Ki Maut" -> "C.I.D: Episodes"
//           "The Big Bang Theory: Season 6: The 43 Peculiarity" -> "The Big Bang Theory"
function extractMainTitle(fullTitle) {
  if (!fullTitle) return fullTitle
  
  let mainTitle = fullTitle.trim()
  
  // Handle specific patterns first
  // Pattern: "Title: Episodes (range): date description" -> "Title: Episodes"
  if (/: Episodes?\s*\(/.test(mainTitle)) {
    const match = mainTitle.match(/^([^:]+: Episodes?)/)
    if (match) {
      return match[1].trim()
    }
  }
  
  // Handle "Title: Season X: Episode Name" or "Title: Season X: Description"
  // Extract just the main title before "Season"
  if (/: Season\s+\d+/i.test(mainTitle)) {
    const match = mainTitle.match(/^([^:]+?)(?:\s*:\s*Season\s+\d+)/i)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  // Handle "Title: Subtitle: Subtitle: Episode Name" patterns
  // For shows like "Crime Patrol: City Crimes: City Crimes: Dhoka"
  // Try to extract the first two parts if they repeat
  const parts = mainTitle.split(':').map(p => p.trim())
  if (parts.length >= 3) {
    // If second and third parts are similar, likely a show with subtitle structure
    // Take first two parts as main title
    const firstPart = parts[0]
    const secondPart = parts[1]
    // Check if this looks like a main title pattern
    if (firstPart && secondPart && firstPart.length > 2) {
      // For patterns like "Crime Patrol: 26 Jurm, 26 Cases: Season 1: ..."
      if (/: Season\s+\d+/.test(mainTitle)) {
        return `${firstPart}: ${secondPart}`.trim()
      }
      // For patterns like "Crime Patrol: City Crimes: City Crimes: ..."
      if (parts.length >= 4 && parts[1] === parts[2]) {
        return `${firstPart}: ${secondPart}`.trim()
      }
    }
  }
  
  // Common patterns to remove (more specific first)
  const patterns = [
    /:\s*Season\s+\d+\s*:.*/i,                    // "Title: Season X: ..."
    /:\s*Episode\s+\d+.*/i,                       // "Title: Episode X"
    /:\s*Episodes?\s+\(\d+-\d+\).*/i,             // "Title: Episodes (X-Y)"
    /:\s*\d{2}-\d{2}-\d{4}.*/i,                   // "Title: 09-11-2025 ..."
    /:\s*\d{4}:\s*.*/i,                           // "Title: 2025: Description"
    /:\s*\d{1,2}\/\d{1,2}\/\d{2,4}.*/i,           // "Title: 11/9/25"
    /:\s*S\d+E\d+.*/i,                            // "Title: S1E5"
    /:\s*Part\s+\d+.*/i,                          // "Title: Part X"
    /:\s*Chapter\s+\d+.*/i,                       // "Title: Chapter X"
  ]
  
  // Apply patterns
  for (const pattern of patterns) {
    const before = mainTitle
    mainTitle = mainTitle.replace(pattern, '').trim()
    // If we made a change and result is reasonable, use it
    if (mainTitle !== before && mainTitle.length >= 3) {
      break
    }
    mainTitle = before
  }
  
  // Remove trailing colons and whitespace
  mainTitle = mainTitle.replace(/:\s*$/, '').trim()
  
  // If we ended up with empty or very short title, return original
  if (!mainTitle || mainTitle.length < 3) {
    return fullTitle
  }
  
  return mainTitle
}

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
  const [isInsightsOpen, setIsInsightsOpen] = useState(false)

  // Initialize theme
  useTheme()

  // persistent UI state (also mirrored to URL for shareability)
  const [search, setSearch] = usePersistentState('search', '')
  const [activeTitle, setActiveTitle] = usePersistentState('activeTitle', null)
  const [startDate, setStartDate] = usePersistentState('startDate', '')
  const [endDate, setEndDate] = usePersistentState('endDate', '')
  // Profile selection - default to all profiles [1,2,3,4,5]
  // usePersistentState handles arrays via JSON, which works fine
  const [selectedProfilesRaw, setSelectedProfilesRaw] = usePersistentState('selectedProfiles', [1, 2, 3, 4, 5])
  
  // Ensure selectedProfiles is always a valid array with at least one profile
  const selectedProfiles = useMemo(() => {
    if (!Array.isArray(selectedProfilesRaw) || selectedProfilesRaw.length === 0) {
      return [1, 2, 3, 4, 5]
    }
    // Filter to only valid profile numbers (1-5)
    const valid = selectedProfilesRaw.filter(p => Number.isInteger(p) && p >= 1 && p <= 5)
    return valid.length > 0 ? valid : [1, 2, 3, 4, 5]
  }, [selectedProfilesRaw])
  
  const setSelectedProfiles = (profiles) => {
    // Ensure at least one profile is selected
    if (Array.isArray(profiles) && profiles.length > 0) {
      setSelectedProfilesRaw(profiles)
    }
  }
  
  const [getQuery, setQuery] = useQueryParams()

  // load CSV files from all profiles
  useEffect(() => {
    setIsLoading(true)
    const profileFiles = [1, 2, 3, 4, 5].map(num => `/data/NetflixViewingHistory_${num}.csv`)
    const loadPromises = profileFiles.map((file, index) => {
      return new Promise((resolve) => {
        Papa.parse(file, {
          header: true,
          download: true,
          dynamicTyping: false,
          complete: ({ data }) => {
            const profileNumber = index + 1
            // Normalize dates to YYYY-MM-DD display and add profile number
            const rows = data
              .filter(r => r.Title && r.Date)
              .map(r => {
                const dt = parseUSDate(r.Date)
                return { 
                  Title: r.Title, 
                  Date: formatYMD(dt),
                  Profile: profileNumber 
                }
              })
            resolve(rows)
          },
          error: () => {
            console.warn(`Failed to load profile ${index + 1} data`)
            resolve([])
          }
        })
      })
    })

    Promise.all(loadPromises).then((allRows) => {
      // Flatten all profiles into a single array
      const merged = allRows.flat()
      // newest first
      merged.sort((a, b) => (a.Date < b.Date ? 1 : -1))
      setRaw(merged)
      setIsLoading(false)
    })
  }, [])

  // Sync local state <-> URL params on first load
  useEffect(() => {
    const qp = getQuery()
    const keys = ['search', 'activeTitle', 'startDate', 'endDate', 'profiles']
    if (keys.some(k => qp[k])) {
      if (qp.search !== undefined) setSearch(qp.search)
      if (qp.activeTitle !== undefined) setActiveTitle(qp.activeTitle || null)
      if (qp.startDate !== undefined) setStartDate(qp.startDate)
      if (qp.endDate !== undefined) setEndDate(qp.endDate)
      if (qp.profiles !== undefined) {
        const profiles = qp.profiles.split(',').map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 5)
        if (profiles.length > 0) setSelectedProfilesRaw(profiles)
      }
    } else {
      // seed URL from localStorage
      setQuery({ 
        search, 
        activeTitle: activeTitle ?? '', 
        startDate, 
        endDate,
        profiles: selectedProfiles.join(',')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Anytime filters change, mirror to URL
  useEffect(() => {
    setQuery({ 
      search, 
      activeTitle: activeTitle ?? '', 
      startDate, 
      endDate,
      profiles: selectedProfiles.join(',')
    })
  }, [search, activeTitle, startDate, endDate, selectedProfiles, setQuery])

  const filtered = useMemo(() => {
    let rows = raw
    // Filter by selected profiles (only if not all 5 are selected for efficiency)
    if (selectedProfiles.length < 5) {
      rows = rows.filter(r => selectedProfiles.includes(r.Profile))
    }
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
  }, [raw, search, activeTitle, startDate, endDate, selectedProfiles])

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

  // Insights calculations
  const insights = useMemo(() => {
    // Yearly data
    const yearlyCounts = new Map()
    filtered.forEach(row => {
      const year = new Date(row.Date).getFullYear()
      yearlyCounts.set(year, (yearlyCounts.get(year) || 0) + 1)
    })
    const yearlyData = Array.from(yearlyCounts.entries())
      .map(([year, count]) => ({ year: year.toString(), count }))
      .sort((a, b) => a.year.localeCompare(b.year))

    // Find peak years (years with count >= 90% of max)
    const maxYearCount = yearlyData.length > 0 ? Math.max(...yearlyData.map(d => d.count)) : 0
    const peakThreshold = maxYearCount * 0.9
    const peakYears = yearlyData.length > 0
      ? yearlyData
          .filter(d => d.count >= peakThreshold)
          .map(d => d.year)
      : []

    // Monthly pattern data (aggregate across all years)
    const monthlyCounts = new Map()
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December']
    
    filtered.forEach(row => {
      const date = new Date(row.Date)
      const monthIndex = date.getMonth()
      monthlyCounts.set(monthIndex, (monthlyCounts.get(monthIndex) || 0) + 1)
    })
    
    const monthlyPatternData = Array.from(monthlyCounts.entries())
      .map(([monthIndex, count]) => ({
        month: MONTHS[monthIndex].substring(0, 3),
        monthIndex,
        count
      }))
      .sort((a, b) => a.monthIndex - b.monthIndex)

    // Find most and least active months
    const sortedMonths = [...monthlyPatternData].sort((a, b) => b.count - a.count)
    const maxMonthCount = sortedMonths[0]?.count || 0
    const minMonthCount = sortedMonths[sortedMonths.length - 1]?.count || 0
    const mostActiveMonths = sortedMonths
      .filter(m => m.count >= maxMonthCount * 0.85)
      .map(m => m.month)
      .slice(0, 5)
    const leastActiveMonths = sortedMonths
      .filter(m => m.count <= minMonthCount * 1.15)
      .map(m => m.month)
      .slice(0, 2)

    // Top titles by main title (extract main titles from episodes)
    const mainTitleCounts = new Map()
    filtered.forEach(row => {
      const mainTitle = extractMainTitle(row.Title)
      mainTitleCounts.set(mainTitle, (mainTitleCounts.get(mainTitle) || 0) + 1)
    })
    const topTitlesByMainTitle = Array.from(mainTitleCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Total views and unique titles
    const totalViews = filtered.length
    const uniqueTitles = new Set(filtered.map(r => r.Title)).size
    const uniqueMainTitles = new Set(filtered.map(r => extractMainTitle(r.Title))).size
    const replayRate = totalViews > 0 ? ((totalViews - uniqueTitles) / totalViews) * 100 : 0

    // Day of week data (reuse existing calculation but format for insights)
    const dayCounts = new Map()
    filtered.forEach(row => {
      const date = new Date(row.Date)
      const dayOfWeek = date.getDay()
      dayCounts.set(dayOfWeek, (dayCounts.get(dayOfWeek) || 0) + 1)
    })
    const dayOfWeekData = Array.from(dayCounts.entries())
      .map(([dayOfWeek, count]) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        dayOfWeek,
        count
      }))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)

    return {
      yearlyData,
      monthlyPatternData,
      topTitlesByMainTitle,
      dayOfWeekData,
      totalViews,
      uniqueTitles,
      uniqueMainTitles,
      replayRate,
      mostActiveMonths,
      leastActiveMonths,
      peakYears
    }
  }, [filtered])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <ThemeToggle />
        <header className="flex flex-col sm:flex-row gap-2 sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Netflix Viewing Explorer</h1>
            <p className="text-muted-foreground text-sm">Filters persist across refresh. Select profiles (1-5), click a donut slice or use search to filter the table.</p>
          </div>
          <button
            onClick={() => setIsInsightsOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
            View Insights
          </button>
        </header>

        <SearchBar value={search} onChange={setSearch} />
        <ProfileSelector 
          selectedProfiles={selectedProfiles}
          onProfilesChange={setSelectedProfiles}
        />
        <Filters
          startDate={startDate}
          endDate={endDate}
          onStart={setStartDate}
          onEnd={setEndDate}
          hasActiveFilters={search || startDate || endDate || activeTitle || (selectedProfiles.length < 5)}
          onClearAll={() => {
            setSearch('')
            setStartDate('')
            setEndDate('')
            setActiveTitle(null)
            setSelectedProfiles([1, 2, 3, 4, 5])
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

      <InsightsDialog
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        insights={insights}
      />
    </div>
  )
}
