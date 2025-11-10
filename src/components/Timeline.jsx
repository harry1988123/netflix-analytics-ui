import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Shimmer from './Shimmer.jsx'
import { Card, CardContent } from './ui/card.jsx'

// Custom tooltip for timeline
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const date = new Date(data.date)
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-slate-900 mb-1">{formattedDate}</p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">{data.count}</span> {data.count === 1 ? 'view' : 'views'}
        </p>
      </div>
    )
  }
  return null
}

export default function Timeline({ data, title = 'Viewing Activity Over Time', isLoading = false }) {
  // Format date for X-axis display - show month and day, or just month if many data points
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    // If we have many data points, show fewer labels
    if (data && data.length > 60) {
      // Show month and year for weekly data
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    } else {
      // Show month and day for daily data
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const day = date.getDate()
      return `${month} ${day}`
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Shimmer height="h-80" />
        </CardContent>
      </Card>
    )
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <div className="h-64 flex items-center justify-center text-slate-500">
            No data to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: data.length > 60 ? 40 : 60 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={formatDate}
                angle={data.length > 60 ? 0 : -45}
                textAnchor={data.length > 60 ? 'middle' : 'end'}
                height={data.length > 60 ? 40 : 60}
                interval={data.length > 30 ? Math.floor(data.length / 10) : 0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                width={50}
                label={{
                  value: 'Views',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
