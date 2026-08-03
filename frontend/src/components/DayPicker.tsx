import { useState } from 'react'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { toDateKey } from '@/assets/global-functions'
import content from '@/content/markEatenModal.json'

interface Props {
  value: string // YYYY-MM-DD
  onChange: (dateKey: string) => void
  // 'past' (default) disallows future dates — used for Mark as Eaten /
  // editing history. 'future' disallows past dates — used for scheduling.
  mode?: 'past' | 'future'
}

export const DayPicker = ({ value, onChange, mode = 'past' }: Props) => {
  const [month, setMonth] = useState(() => { const d = new Date(value + 'T00:00:00'); d.setDate(1); return d })

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const leadingBlanks = firstDay.getDay()
  const todayKey = toDateKey(new Date())
  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth()

  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(year, monthIndex, i + 1))),
  ]

  const shiftMonth = (delta: number) => setMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() + delta); return n })
  const isDisallowed = (dateKey: string) => mode === 'past' ? dateKey > todayKey : dateKey < todayKey

  return (
    <div className="day-picker">
      <div className="history-calendar-nav">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label={content.prevMonthLabel}
          disabled={mode === 'future' && isCurrentMonth}
        >
          <CaretLeftIcon weight="bold" />
        </button>
        <span>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label={content.nextMonthLabel}
          disabled={mode === 'past' && isCurrentMonth}
        >
          <CaretRightIcon weight="bold" />
        </button>
      </div>

      <div className="history-calendar-grid">
        {content.weekdayLabels.map(w => <div key={w} className="history-calendar-weekday">{w}</div>)}
        {cells.map((dateKey, i) => {
          if (!dateKey) return <div key={`blank-${i}`} className="history-calendar-cell empty" />
          const disallowed = isDisallowed(dateKey)
          const isToday = dateKey === todayKey
          const isSelected = dateKey === value
          return (
            <button
              type="button"
              key={dateKey}
              className={`history-calendar-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${!disallowed ? ' has-entries' : ''}`}
              onClick={() => !disallowed && onChange(dateKey)}
              disabled={disallowed}
            >
              <span className="history-calendar-daynum">{Number(dateKey.slice(-2))}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
