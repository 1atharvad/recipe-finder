import { useEffect, useState } from 'react'
import { adminApi } from '@/api/api'
import type { Analytics } from '@/types'
import content from '@/content/adminAnalyticsPage.json'

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="recipe-page-loading">{content.loadingLabel}</div>
  if (!analytics) return null

  const stats: [string, number][] = [
    [content.stats.totalUsers, analytics.totalUsers],
    [content.stats.totalGeneralRecipes, analytics.totalGeneralRecipes],
    [content.stats.totalPublicUserRecipes, analytics.totalPublicUserRecipes],
    [content.stats.totalFavorites, analytics.totalFavorites],
    [content.stats.totalHistoryEntries, analytics.totalHistoryEntries],
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h2>{content.title}</h2>
      </div>

      <div className="admin-stats-grid">
        {stats.map(([label, value]) => (
          <div key={label} className="admin-stat-card">
            <span className="admin-stat-value">{value}</span>
            <span className="admin-stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="admin-analytics-lists">
        <div className="admin-card">
          <h3>{content.topFavoritedTitle}</h3>
          {analytics.topFavorited.length === 0 ? (
            <p className="admin-empty-text">{content.emptyText}</p>
          ) : (
            <ol className="admin-rank-list">
              {analytics.topFavorited.map(r => (
                <li key={r.recipeId}>
                  <span>{r.recipeName}</span>
                  <span className="admin-rank-count">{r.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="admin-card">
          <h3>{content.topCookedTitle}</h3>
          {analytics.topCooked.length === 0 ? (
            <p className="admin-empty-text">{content.emptyText}</p>
          ) : (
            <ol className="admin-rank-list">
              {analytics.topCooked.map(r => (
                <li key={r.recipeId}>
                  <span>{r.recipeName}</span>
                  <span className="admin-rank-count">{r.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
