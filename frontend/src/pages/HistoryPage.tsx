import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { historyApi } from '../api/api'
import type { EatingHistoryEntry } from '../types'

export const HistoryPage = () => {
  const [history, setHistory] = useState<EatingHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyApi.getAll()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="recipe-page-loading">Loading history...</div>

  if (history.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <h2>No history yet</h2>
          <p>Mark recipes as eaten from any recipe page to track your meals.</p>
          <Link to="/" className="btn-primary">Browse Recipes</Link>
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
        <h2>Eating History</h2>
        <p>{history.length} meal{history.length !== 1 ? 's' : ''} tracked</p>
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
                <span className="history-entry-icon">🍽️</span>
                <span>{entry.recipe.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0]) return 'Today'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'

  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
