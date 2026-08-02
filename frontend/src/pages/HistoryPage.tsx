import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { historyApi } from '@/api/api'
import type { EatingHistoryEntry } from '@/types'
import content from '@/content/historyPage.json'

export const HistoryPage = () => {
  const [history, setHistory] = useState<EatingHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyApi.getAll()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="recipe-page-loading">{content.loadingLabel}</div>

  if (history.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-icon">{content.emptyIcon}</span>
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
          <Link to="/dashboard/search" className="btn-primary">{content.browseLabel}</Link>
        </div>
      </div>
    )
  }

  // Group by date
  const grouped = history.reduce<Record<string, EatingHistoryEntry[]>>((acc, entry) => {
    const date = entry.eatenOn
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="page">
      <div className="page-header">
        <h2>{content.title}</h2>
        <p>{history.length} {content.countWord}{history.length !== 1 ? 's' : ''} {content.countSuffix}</p>
      </div>
      <div className="history-list">
        {sortedDates.map(date => (
          <div key={date} className="history-day-group">
            <div className="history-day-label">{formatDate(date)}</div>
            {grouped[date].map(entry => (
              <Link
                key={entry.id}
                to={`/recipe/${entry.recipe.id}`}
                className="history-entry"
              >
                <span className="history-entry-icon">{content.entryIcon}</span>
                <span>{entry.recipe.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0]) return content.todayLabel
  if (dateStr === yesterday.toISOString().split('T')[0]) return content.yesterdayLabel

  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
