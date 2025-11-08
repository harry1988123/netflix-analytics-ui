import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DonutShimmer } from './Shimmer.jsx'

// Extended color palette for more items
const BASE_COLORS = [
  '#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#14B8A6', '#F43F5E', '#EC4899', '#06B6D4',
  '#3B82F6', '#84CC16', '#F97316', '#A855F7', '#22D3EE',
  '#34D399', '#FBBF24', '#FB7185', '#60A5FA', '#4ADE80',
  '#FB923C', '#C084FC', '#2DD4BF', '#FCD34D', '#F87171'
]

// Generate colors with variations for better distinction
const generateColors = (count) => {
  const colors = []
  for (let i = 0; i < count; i++) {
    const baseColor = BASE_COLORS[i % BASE_COLORS.length]
    colors.push(baseColor)
  }
  return colors
}

export default function Donut({ data, activeKey, onSliceClick, title = 'Top Titles', isLoading = false }) {
  if (isLoading) {
    return (
      <div className="card p-4">
        <DonutShimmer />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="h-[600px] min-h-[600px] flex items-center justify-center text-slate-500">
          No data to display
        </div>
      </div>
    )
  }

  const colors = generateColors(data.length)
  // Calculate total once
  const total = data.reduce((sum, item) => sum + item.count, 0)

  // Create a tooltip wrapper that has access to the total
  const renderTooltip = (props) => {
    if (props.active && props.payload && props.payload.length) {
      const entry = props.payload[0]
      const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0'

      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-slate-900 mb-1">{entry.name}</p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">{entry.value}</span> views
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {activeKey && <button className="text-sm underline text-slate-600 hover:text-slate-900" onClick={() => onSliceClick(null)}>Clear</button>}
      </div>
      <div className="h-[600px] min-h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={90}
              outerRadius={160}
              paddingAngle={1.5}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index]}
                  strokeWidth={activeKey === entry.name ? 4 : 1}
                  stroke={activeKey === entry.name ? '#1e293b' : '#ffffff'}
                  onClick={() => onSliceClick(entry.name)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip
              content={renderTooltip}
            />
            <Legend
              verticalAlign="bottom"
              height={"auto"}
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              iconType="circle"
              formatter={(value) => {
                const truncated = value.length > 35 ? `${value.substring(0, 35)}...` : value
                return truncated
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
