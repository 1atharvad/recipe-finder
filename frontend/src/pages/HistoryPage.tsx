import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClockCounterClockwiseIcon, ForkKnifeIcon, CalendarBlankIcon, ListBulletsIcon,
  CaretLeftIcon, CaretRightIcon,
} from '@phosphor-icons/react'
import { toast } from 'advi-ui'
import { historyApi } from '@/api/api'
import { MarkEatenModal } from '@/components/MarkEatenModal'
import { HistoryDetailModal } from '@/components/HistoryDetailModal'
import { TimelinePageSkeleton } from '@/components/Skeleton'
import { formatTime, toDateKey } from '@/assets/global-functions'
import type { EatingHistoryEntry } from '@/types'
import content from '@/content/historyPage.json'

type View = 'timeline' | 'calendar'

export const HistoryPage = () => {
  const [history, setHistory] = useState<EatingHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('timeline')
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [detailEntry, setDetailEntry] = useState<EatingHistoryEntry | null>(null)
  const [editEntry, setEditEntry] = useState<EatingHistoryEntry | null>(null)

  useEffect(() => {
    historyApi.getAll()
      .then(setHistory)
      .catch(() => toast.error(content.actionErrorMessage))
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    return history.reduce<Record<string, EatingHistoryEntry[]>>((acc, entry) => {
      const date = entry.eatenOn
      if (!acc[date]) acc[date] = []
      acc[date].push(entry)
      return acc
    }, {})
  }, [history])

  const handleEditSave = async (eatenAt: string) => {
    if (!editEntry) return
    try {
      const updated = await historyApi.updateEntry(editEntry.id, eatenAt)
      setHistory(prev => prev.map(e => e.id === updated.id ? updated : e))
    } catch {
      toast.error(content.actionErrorMessage)
    }
    setEditEntry(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(content.deleteConfirm)) return
    const prev = history
    setHistory(h => h.filter(e => e.id !== id))
    setDetailEntry(null)
    try {
      await historyApi.deleteEntry(id)
    } catch {
      setHistory(prev)
      toast.error(content.actionErrorMessage)
    }
  }

  if (loading) return <TimelinePageSkeleton />

  if (history.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <ClockCounterClockwiseIcon weight="fill" className="empty-icon-svg" />
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
          <Link to="/dashboard" className="btn-pill btn-primary">{content.browseLabel}</Link>
        </div>
      </div>
    )
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="page">
      <div className="hero-page-header">
        <div>
          <span className="hero-eyebrow">
            <ClockCounterClockwiseIcon weight="fill" /> {history.length} {content.countWord}{history.length !== 1 ? 's' : ''} {content.countSuffix}
          </span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
        <div className="view-toggle">
          <button
            className={view === 'timeline' ? 'active' : ''}
            onClick={() => setView('timeline')}
          >
            <ListBulletsIcon weight="bold" /> {content.timelineViewLabel}
          </button>
          <button
            className={view === 'calendar' ? 'active' : ''}
            onClick={() => setView('calendar')}
          >
            <CalendarBlankIcon weight="bold" /> {content.calendarViewLabel}
          </button>
        </div>
      </div>

      {view === 'timeline' ? (
        <div className="history-timeline">
          {sortedDates.map(date => (
            <div key={date} className="history-day-group">
              <div className="history-day-marker">
                <span className="history-day-dot" />
                <span className="history-day-label">{formatDate(date)}</span>
              </div>
              <div className="history-day-entries">
                {grouped[date].map(entry => (
                  <HistoryEntryRow key={entry.id} entry={entry} onOpen={setDetailEntry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <HistoryCalendar
          month={month}
          setMonth={setMonth}
          grouped={grouped}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onOpen={setDetailEntry}
        />
      )}

      {detailEntry && (
        <HistoryDetailModal
          entry={detailEntry}
          onEdit={() => { setEditEntry(detailEntry); setDetailEntry(null) }}
          onDelete={() => handleDelete(detailEntry.id)}
          onClose={() => setDetailEntry(null)}
        />
      )}

      {editEntry && (
        <MarkEatenModal
          initial={editEntry.recordedAt}
          onConfirm={handleEditSave}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  )
}

interface EntryRowProps {
  entry: EatingHistoryEntry
  onOpen: (entry: EatingHistoryEntry) => void
}

const HistoryEntryRow = ({ entry, onOpen }: EntryRowProps) => (
  <button type="button" className="history-entry" onClick={() => onOpen(entry)}>
    <span className="history-entry-link">
      <ForkKnifeIcon weight="bold" className="history-entry-icon" />
      <span className="history-entry-name">{entry.recipe.name}</span>
      <span className="history-entry-time">{formatTime(entry.recordedAt)}</span>
    </span>
  </button>
)

interface CalendarProps {
  month: Date
  setMonth: (updater: (d: Date) => Date) => void
  grouped: Record<string, EatingHistoryEntry[]>
  selectedDate: string | null
  setSelectedDate: (d: string | null) => void
  onOpen: (entry: EatingHistoryEntry) => void
}

const HistoryCalendar = ({ month, setMonth, grouped, selectedDate, setSelectedDate, onOpen }: CalendarProps) => {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const leadingBlanks = firstDay.getDay()
  const todayKey = toDateKey(new Date())

  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(year, monthIndex, i + 1))),
  ]

  const shiftMonth = (delta: number) => setMonth(d => { const n = new Date(d); n.setMonth(n.getMonth() + delta); return n })

  return (
    <div className="history-calendar">
      <div className="history-calendar-nav">
        <button onClick={() => shiftMonth(-1)} aria-label={content.prevMonthLabel}><CaretLeftIcon weight="bold" /></button>
        <span>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => shiftMonth(1)} aria-label={content.nextMonthLabel}><CaretRightIcon weight="bold" /></button>
      </div>

      <div className="history-calendar-grid with-events">
        {content.weekdayLabels.map(w => <div key={w} className="history-calendar-weekday">{w}</div>)}
        {cells.map((dateKey, i) => {
          if (!dateKey) return <div key={`blank-${i}`} className="history-calendar-cell empty" />
          const entries = grouped[dateKey] ?? []
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate
          const visible = entries.slice(0, 3)
          const overflow = entries.length - visible.length
          return (
            <button
              key={dateKey}
              className={`history-calendar-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${entries.length ? ' has-entries' : ''}`}
              onClick={() => entries.length && setSelectedDate(isSelected ? null : dateKey)}
              disabled={!entries.length}
            >
              <span className="history-calendar-daynum">{Number(dateKey.slice(-2))}</span>
              <span className="history-calendar-chips">
                {visible.map(entry => (
                  <span key={entry.id} className="history-calendar-chip">{entry.recipe.name}</span>
                ))}
                {overflow > 0 && <span className="history-calendar-chip more">{content.moreEntriesLabel.replace('{n}', String(overflow))}</span>}
              </span>
            </button>
          )
        })}
      </div>

      {selectedDate && grouped[selectedDate] && (
        <div className="history-day-entries history-calendar-selected">
          <div className="history-day-label">{formatDate(selectedDate)}</div>
          {grouped[selectedDate].map(entry => (
            <HistoryEntryRow key={entry.id} entry={entry} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dateStr === toDateKey(today)) return content.todayLabel
  if (dateStr === toDateKey(yesterday)) return content.yesterdayLabel

  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
