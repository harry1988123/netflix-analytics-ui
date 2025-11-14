import React, { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import Dialog from './Dialog.jsx'
import YearlyChart from './YearlyChart.jsx'
import MonthlyPatternChart from './MonthlyPatternChart.jsx'
import BarChart from './BarChart.jsx'
import DayOfWeekChart from './DayOfWeekChart.jsx'
import { Card, CardContent } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { getChatGPTInsights, getGeminiInsights } from '../lib/aiService.js'

export default function InsightsDialog({ isOpen, onClose, insights }) {
  const [aiProvider, setAiProvider] = useState('gemini') // 'gemini' (ChatGPT temporarily disabled)
  const [aiInsights, setAiInsights] = useState(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(null)
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

  const fetchAIInsights = useCallback(async () => {
    if (!insights) return

    setIsLoadingAI(true)
    setAiError(null)

    try {
      const result = aiProvider === 'chatgpt'
        ? await getChatGPTInsights(insights)
        : await getGeminiInsights(insights)

      setAiInsights(result)
    } catch (error) {
      setAiError(error.message)
      console.error('AI Insights Error:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }, [insights, aiProvider])

  // Fetch AI insights when dialog opens or provider changes
  useEffect(() => {
    if (isOpen && insights) {
      fetchAIInsights()
    }
  }, [isOpen, insights, fetchAIInsights])

  const handleProviderChange = (provider) => {
    setAiProvider(provider)
    setAiInsights(null)
    setAiError(null)
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Viewing Insights & Analytics">
      <div className="space-y-6">
        {/* AI Provider Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">AI-Powered Insights</h3>
              <div className="flex gap-2">
                {/* ChatGPT temporarily disabled */}
                <Button
                  variant={aiProvider === 'gemini' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleProviderChange('gemini')}
                  disabled={true}
                >
                  Gemini
                </Button>
              </div>
            </div>

            {/* AI Insights Display */}
            {isLoadingAI && (
              <div className="p-4 text-center text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                Generating AI insights...
              </div>
            )}

            {aiError && (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive font-medium mb-2">Error loading AI insights</p>
                  <p className="text-xs text-muted-foreground">{aiError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAIInsights}
                    className="mt-3"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {aiInsights && !isLoadingAI && (
              <Card className="bg-primary/5 border border-primary/20">
                <CardContent className="p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold prose-ul:text-muted-foreground prose-li:text-muted-foreground">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-lg font-semibold text-foreground mb-3 mt-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-semibold text-foreground mb-2 mt-4">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mb-2 mt-3">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 text-sm text-muted-foreground leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-muted-foreground">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm text-muted-foreground">{children}</ol>,
                        li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                        hr: () => <hr className="my-4 border-border" />,
                        code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic my-2 text-muted-foreground">{children}</blockquote>
                      }}
                    >
                      {aiInsights}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {!aiInsights && !isLoadingAI && !aiError && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Click on a provider above to generate AI-powered insights
              </div>
            )}
          </CardContent>
        </Card>
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Items Watched</div>
              <div className="text-3xl font-bold text-foreground">{totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Unique Titles</div>
              <div className="text-3xl font-bold text-foreground">{uniqueTitles.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Replay Rate</div>
              <div className="text-3xl font-bold text-foreground">{replayRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {replayRate < 10 ? 'Preference for new content' : 'Mix of new and rewatched content'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Viewing */}
        <YearlyChart data={yearlyData} title="Yearly Viewing Activity" />

        {/* Monthly Pattern */}
        <MonthlyPatternChart data={monthlyPatternData} title="Monthly Viewing Pattern" />

        {/* Day of Week */}
        <DayOfWeekChart data={dayOfWeekData} title="Viewing by Day of Week" />

        {/* Top Shows/Franchises Table */}
        {topTitlesByMainTitle.length > 0 && (
          <Card>
            <CardContent className="p-4">
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
                          className={`border-b border-border transition-colors hover:bg-accent ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
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
            </CardContent>
          </Card>
        )}

        {/* Top Titles by Main Title Chart */}
        <BarChart data={topTitlesByMainTitle} title="Top 10 Titles (Main Titles)" />
      </div>
    </Dialog>
  )
}

