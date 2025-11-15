import React, { useState, useCallback } from 'react'
import { Card, CardContent } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { Input } from './ui/input.jsx'
import ReactMarkdown from 'react-markdown'
import { performSmartSearch } from '../lib/ragService.js'

export default function SmartSearch({ onResults, onError }) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [relevantEntries, setRelevantEntries] = useState([])
  const [error, setError] = useState(null)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setAnswer('')
    setSources([])
    setRelevantEntries([])

    try {
      const result = await performSmartSearch(query, {
        nResults: 10,
        stream: false
      })

      setAnswer(result.answer || 'No answer generated.')
      setSources(result.sources || [])
      setRelevantEntries(result.relevantEntries || [])

      // Notify parent component
      if (onResults) {
        onResults({
          answer: result.answer,
          sources: result.sources,
          relevantEntries: result.relevantEntries
        })
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to perform smart search'
      setError(errorMessage)
      if (onError) {
        onError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [query, onResults, onError])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              type="text"
              placeholder="Ask a question about your viewing history... (e.g., 'Tell me the Christmas trend, what are things watched?')"
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="text-destructive">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {answer && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Answer</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold prose-ul:text-muted-foreground prose-li:text-muted-foreground">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-muted-foreground">{children}</li>
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {sources.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Sources</h3>
            <div className="space-y-2">
              {sources.slice(0, 5).map((source, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg border border-border"
                >
                  <div className="font-medium text-foreground">{source.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Date: {source.date} | Profile: {source.profile}
                    {source.mainTitle && source.mainTitle !== source.title && (
                      <> | Main Title: {source.mainTitle}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {relevantEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Relevant Viewing Entries</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-foreground">Date</th>
                    <th className="text-left p-2 font-semibold text-foreground">Profile</th>
                    <th className="text-left p-2 font-semibold text-foreground">Title</th>
                    <th className="text-left p-2 font-semibold text-foreground">Main Title</th>
                  </tr>
                </thead>
                <tbody>
                  {relevantEntries.slice(0, 10).map((entry, index) => (
                    <tr key={index} className="border-b border-border hover:bg-accent">
                      <td className="p-2 text-muted-foreground">{entry.date}</td>
                      <td className="p-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          {entry.profile}
                        </span>
                      </td>
                      <td className="p-2 text-foreground">{entry.title}</td>
                      <td className="p-2 text-muted-foreground">{entry.mainTitle || entry.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

