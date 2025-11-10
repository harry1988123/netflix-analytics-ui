import React from 'react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Shimmer from './Shimmer.jsx'
import { Card, CardContent } from './ui/card.jsx'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E', '#EC4899', '#3B82F6', '#A855F7']

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-slate-900 mb-1">{data.month}</p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">{data.count.toLocaleString()}</span> {data.count === 1 ? 'view' : 'views'}
        </p>
      </div>
    )
  }
  return null
}

export default function MonthlyPatternChart({ data, title = 'Monthly Viewing Pattern', isLoading = false }) {
  // Ensure all months are present
  const completeData = MONTHS.map((month, index) => {
    const existing = data.find(d => d.monthIndex === index)
    return existing || { month, monthIndex: index, count: 0 }
  })

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
            <RechartsBarChart
              data={completeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {completeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
      </CardContent>
    </Card>
  )
}

