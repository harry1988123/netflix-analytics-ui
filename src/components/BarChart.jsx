import React from 'react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Shimmer from './Shimmer.jsx'
import { Card, CardContent } from './ui/card.jsx'

const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F43F5E', '#EC4899', '#3B82F6']

// Custom tooltip for bar chart
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
                <p className="text-sm text-slate-700">
                    <span className="font-medium">{data.count}</span> {data.count === 1 ? 'view' : 'views'}
                </p>
            </div>
        )
    }
    return null
}

export default function BarChart({ data, title = 'Top Titles', isLoading = false }) {
    // Truncate long titles for display
    const formatLabel = (name) => {
        if (name.length > 20) {
            return `${name.substring(0, 20)}...`
        }
        return name
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
                            data={data.slice(0, 10)}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" stroke="#64748b" fontSize={12} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                stroke="#64748b"
                                fontSize={11}
                                width={110}
                                tickFormatter={formatLabel}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.slice(0, 10).map((entry, index) => (
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

