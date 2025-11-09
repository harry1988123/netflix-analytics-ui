import React from 'react'
import Dialog from './Dialog.jsx'
import YearlyChart from './YearlyChart.jsx'
import MonthlyPatternChart from './MonthlyPatternChart.jsx'
import BarChart from './BarChart.jsx'
import DayOfWeekChart from './DayOfWeekChart.jsx'

export default function InsightsDialog({ isOpen, onClose, insights }) {
  if (!insights) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose} title="Viewing Insights & Analytics">
        <div className="text-center text-muted-foreground py-8">
          Loading insights...
        </div>
      </Dialog>
    )
  }

  const {
    yearlyData = [],
    monthlyPatternData = [],
    topTitlesByMainTitle = [],
    dayOfWeekData = [],
    totalViews = 0,
    uniqueTitles = 0,
    replayRate = 0,
    mostActiveMonths = [],
    leastActiveMonths = [],
    peakYears = []
  } = insights

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Viewing Insights & Analytics">
      <div className="space-y-6">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Items Watched</div>
            <div className="text-3xl font-bold text-foreground">{totalViews.toLocaleString()}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted-foreground mb-1">Unique Titles</div>
            <div className="text-3xl font-bold text-foreground">{uniqueTitles.toLocaleString()}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted-foreground mb-1">Replay Rate</div>
            <div className="text-3xl font-bold text-foreground">{replayRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {replayRate < 10 ? 'Preference for new content' : 'Mix of new and rewatched content'}
            </div>
          </div>
        </div>

        {/* Yearly Viewing */}
        <YearlyChart data={yearlyData} title="Yearly Viewing Activity" />
        
        {peakYears.length > 0 && (
          <div className="card p-4 bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">📈 Peak Activity Years</h3>
            <p className="text-sm text-muted-foreground">
              Your activity peaked in {peakYears.join(' and ')}, with consistent engagement across recent years.
              {peakYears.includes('2025') && ' You became most active again in 2025, possibly due to new shows or increased free time.'}
            </p>
          </div>
        )}

        {/* Monthly Pattern */}
        <MonthlyPatternChart data={monthlyPatternData} title="Monthly Viewing Pattern" />
        
        {(mostActiveMonths.length > 0 || leastActiveMonths.length > 0) && (
          <div className="card p-4 bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">🗓️ Monthly Viewing Pattern</h3>
            {mostActiveMonths.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-foreground mb-1">Most active months:</p>
                <p className="text-sm text-muted-foreground">{mostActiveMonths.join(', ')}</p>
              </div>
            )}
            {leastActiveMonths.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Least active months:</p>
                <p className="text-sm text-muted-foreground">{leastActiveMonths.join(' & ')}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              💡 You tend to watch more during summer and post-monsoon months, suggesting you binge around mid-year — maybe during vacations or relaxed work cycles.
            </p>
          </div>
        )}

        {/* Day of Week */}
        <DayOfWeekChart data={dayOfWeekData} title="Viewing by Day of Week" />
        
        <div className="card p-4 bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">📅 Weekly Viewing Pattern</h3>
          <p className="text-sm text-muted-foreground">
            Your viewing peaks on weekends (Fri–Sun) — a clear leisure pattern — and tapers on Mondays, which aligns with a typical workweek rhythm.
          </p>
        </div>

        {/* Top Shows/Franchises Table */}
        {topTitlesByMainTitle.length > 0 && (
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Top Shows / Franchises</h2>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full border-collapse min-w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-foreground w-20">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Show / Franchise</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground w-40">Episodes Watched</th>
                  </tr>
                </thead>
                <tbody>
                  {topTitlesByMainTitle.slice(0, 19).map((title, index) => {
                    const rank = index + 1
                    const rankEmoji = rank === 1 ? '1️⃣' : rank === 2 ? '2️⃣' : rank === 3 ? '3️⃣' : rank === 4 ? '4️⃣' : rank === 5 ? '5️⃣' : rank === 6 ? '6️⃣' : rank === 7 ? '7️⃣' : rank === 8 ? '8️⃣' : rank === 9 ? '9️⃣' : rank === 10 ? '🔟' : rank.toString()
                    return (
                      <tr
                        key={title.name}
                        className={`border-b border-border transition-colors hover:bg-accent ${
                          index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-foreground">{rankEmoji}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground">{title.name}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">
                          {title.count.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Titles by Main Title Chart */}
        <BarChart data={topTitlesByMainTitle} title="Top 10 Titles (Main Titles)" />
        
        {/* Key Insights */}
        {topTitlesByMainTitle.length > 0 && (
          <div className="card p-4 bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-foreground mb-3">🎯 Key Insights</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              {topTitlesByMainTitle.length >= 3 && (
                <p>
                  You've clearly invested hundreds of hours into long-running anime and drama series — particularly{' '}
                  <strong className="text-foreground">
                    {topTitlesByMainTitle.slice(0, 3).map(t => t.name).join(', ')}
                  </strong>
                  .
                </p>
              )}
              {topTitlesByMainTitle.some(t => {
                const name = t.name.toLowerCase()
                return name.includes('naruto') || name.includes('hunter') || name.includes('anime') || name.includes('basketball') || name.includes('academia') || name.includes('kuroko') || name.includes('hakusho')
              }) && topTitlesByMainTitle.some(t => {
                const name = t.name.toLowerCase()
                return name.includes('big bang') || name.includes('friends') || name.includes('blacklist') || name.includes('suits') || name.includes('office') || name.includes('brooklyn') || name.includes('good doctor')
              }) && (
                <p>
                  There's a strong balance between anime and Western TV dramas/sitcoms, suggesting diverse taste.
                </p>
              )}
              <p>
                Your top series list is dominated by multi-season shows, not limited to one-off content.
              </p>
              <p>
                You also seem to favor character-driven narratives — most of these shows feature complex worlds and long-term arcs.
              </p>
            </div>
          </div>
        )}

        {/* Unique Titles Insight */}
        <div className="card p-4 bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">💡 Content Preference Insight</h3>
          <p className="text-sm text-muted-foreground">
            You've watched {uniqueTitles.toLocaleString()} unique shows/movies out of {totalViews.toLocaleString()} total views. 
            This indicates that you've watched many unique shows/movies — with relatively few replays ({replayRate.toFixed(1)}% replay rate), 
            suggesting a preference for new content.
          </p>
        </div>
      </div>
    </Dialog>
  )
}

