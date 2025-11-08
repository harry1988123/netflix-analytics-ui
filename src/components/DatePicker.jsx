import React, { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid } from 'date-fns'
import 'react-day-picker/dist/style.css'

export default function DatePicker({ value, onChange, placeholder = 'Select date' }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(() => {
        if (value) {
            const parsed = parse(value, 'yyyy-MM-dd', new Date())
            return isValid(parsed) ? parsed : null
        }
        return null
    })
    const containerRef = useRef(null)

    // Set date range: from 2019-11-16 to today
    const minDate = new Date(2019, 10, 16) // November 16, 2019 (month is 0-indexed)
    const maxDate = new Date() // Today's date
    maxDate.setHours(23, 59, 59, 999) // Set to end of today

    useEffect(() => {
        if (value) {
            const parsed = parse(value, 'yyyy-MM-dd', new Date())
            setSelectedDate(isValid(parsed) ? parsed : null)
        } else {
            setSelectedDate(null)
        }
    }, [value])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen])

    const handleSelect = (date) => {
        if (date) {
            // Only allow dates between 2019-11-16 and today
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
            const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())

            if (dateOnly < minDateOnly || dateOnly > maxDateOnly) {
                return // Don't select dates outside the allowed range
            }
            setSelectedDate(date)
            onChange(format(date, 'yyyy-MM-dd'))
            setIsOpen(false)
        } else {
            setSelectedDate(null)
            onChange('')
        }
    }

    const displayValue = selectedDate ? format(selectedDate, 'MMM dd, yyyy') : placeholder

    // Set date range for dropdowns - from 2019-11-16 to today
    const startMonth = new Date(2019, 10, 1) // November 2019
    const endMonth = new Date() // Current month

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full rounded-xl border border-input bg-background px-3 py-2 text-left text-sm outline-none transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:border-ring ${!selectedDate ? 'text-muted-foreground' : 'text-foreground'
                    }`}
            >
                <span className="flex items-center justify-between">
                    <span>{displayValue}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                    >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 rounded-lg border border-border bg-popover p-4 shadow-lg">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        startMonth={startMonth}
                        endMonth={endMonth}
                        disabled={(date) => {
                            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                            const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
                            const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
                            return dateOnly < minDateOnly || dateOnly > maxDateOnly
                        }}
                        className="rdp"
                        classNames={{
                            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                            month: 'space-y-4',
                            month_caption: 'flex justify-center pt-1 relative items-center mb-4',
                            caption_label: 'hidden',
                            dropdowns: 'flex justify-center gap-2 items-center',
                            dropdown_root: 'relative inline-flex items-center',
                            dropdown: 'h-8 min-w-[120px] rounded-md border border-slate-300 bg-white px-3 py-1 pr-8 text-sm font-medium text-slate-900 outline-none appearance-none hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer',
                            months_dropdown: 'h-8 min-w-[120px] rounded-md border border-slate-300 bg-white px-3 py-1 pr-8 text-sm font-medium text-slate-900 outline-none appearance-none hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer',
                            years_dropdown: 'h-8 min-w-[100px] rounded-md border border-slate-300 bg-white px-3 py-1 pr-8 text-sm font-medium text-slate-900 outline-none appearance-none hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer',
                            chevron: 'hidden',
                            nav: 'hidden',
                            button_previous: 'hidden',
                            button_next: 'hidden',
                            table: 'w-full border-collapse space-y-1 mt-4',
                            head_row: 'flex mb-2',
                            head_cell: 'text-slate-500 rounded-md w-9 font-normal text-[0.8rem]',
                            row: 'flex w-full mt-2',
                            cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                            day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors',
                            day_selected: 'bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white',
                            day_today: 'bg-slate-100 text-slate-900 font-semibold',
                            day_outside: 'text-slate-400 opacity-50',
                            day_disabled: 'text-slate-300 opacity-50 cursor-not-allowed',
                            day_range_middle: 'aria-selected:bg-slate-100 aria-selected:text-slate-900',
                            day_hidden: 'invisible',
                        }}
                        components={{
                            Select: ({ children, ...props }) => (
                                <select
                                    {...props}
                                    className="h-8 min-w-[120px] rounded-md border border-slate-300 bg-white px-3 py-1 pr-8 text-sm font-medium text-slate-900 outline-none appearance-none hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%236b7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22M6 8l4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
                                >
                                    {children}
                                </select>
                            ),
                            Option: ({ children, ...props }) => (
                                <option {...props}>{children}</option>
                            ),
                            Chevron: () => null,
                            IconLeft: () => null,
                            IconRight: () => null,
                        }}
                    />
                </div>
            )}
        </div>
    )
}
