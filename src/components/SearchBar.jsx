import React, { useState, useEffect, useRef } from 'react'
import { Input } from './ui/input.jsx'
import { Card } from './ui/card.jsx'

export default function SearchBar({ value, onChange }) {
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

  return (
    <Card className="p-3 flex items-center gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        type="text"
        placeholder="Search title..."
        className="w-full"
      />
    </Card>
  )
}
