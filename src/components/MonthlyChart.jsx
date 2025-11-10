import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Shimmer from './Shimmer.jsx'
import { Card, CardContent } from './ui/card.jsx'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-slate-900 mb-1">{data.month}</p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">{data.count}</span> {data.count === 1 ? 'view' : 'views'}
        </p>
      </div>
    )
  }
  return null
}

export default function MonthlyChart({ data, title = 'Viewing by Month', isLoading = false }) {
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
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ fill: '#6366F1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      </CardContent>
    </Card>
  )
}

