import React, { useState, useEffect, useRef } from 'react'
import { Input } from './ui/input.jsx'
import { Card } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import SmartSearch from './SmartSearch.jsx'

export default function SearchBar({ value, onChange, smartSearchMode, onSmartSearchModeChange }) {
  const [inputValue, setInputValue] = useState(value)
  const timeoutRef = useRef(null)
  const prevValueRef = useRef(value)

  // Update local state when prop value changes externally (e.g., from URL/localStorage)
  useEffect(() => {
    // Only sync if the prop value changed externally (not from our debounced update)
    if (value !== prevValueRef.current && value !== inputValue) {
      // Clear any pending debounced update
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setInputValue(value)
    }
    prevValueRef.current = value
  }, [value, inputValue])

  // Debounce the onChange callback when user types
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Only debounce if inputValue differs from prop value (user is typing)
    if (inputValue !== value) {
      timeoutRef.current = setTimeout(() => {
        onChange(inputValue)
        prevValueRef.current = inputValue
      }, 300) // 300ms delay
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  // If smart search mode is enabled, show SmartSearch component
  if (smartSearchMode) {
    return (
      <div className="space-y-2">
        <Card className="p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Smart Search Mode</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSmartSearchModeChange?.(false)}
          >
            Switch to Regular Search
          </Button>
        </Card>
        <SmartSearch />
      </div>
    )
  }

  return (
    <Card className="p-3 flex items-center gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        type="text"
        placeholder="Search title..."
        className="w-full"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSmartSearchModeChange?.(true)}
        title="Enable AI-powered smart search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Smart
      </Button>
    </Card>
  )
}
