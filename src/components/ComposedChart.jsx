import React from 'react'
import { ComposedChart as RechartsComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Shimmer from './Shimmer.jsx'
import { Card, CardContent } from './ui/card.jsx'

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-slate-700" style={{ color: entry.color }}>
            <span className="font-medium">{entry.value}</span> {entry.name}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ComposedChart({ data, title = 'Viewing Trends', isLoading = false }) {
  // Calculate average for the line
  const avg = data.length > 0
    ? Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length)
    : 0

  const dataWithAvg = data.map(item => ({
    ...item,
    average: avg,
    shortName: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name
  }))

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Shimmer height="h-80" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500">
          No data to display
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsComposedChart
              data={dataWithAvg}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="shortName"
                stroke="#64748b"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} name="Views" />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Average"
                dot={false}
              />
            </RechartsComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      </CardContent>
    </Card>
  )
}

