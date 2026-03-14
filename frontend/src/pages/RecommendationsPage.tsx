import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recommendationApi } from '../api/api'
import type { RecommendationDTO } from '../types'
import { PreferencesModal } from '../components/PreferencesModal'

export const RecommendationsPage = () => {
  const navigate = useNavigate()
  const [recs, setRecs] = useState<RecommendationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [showPrefs, setShowPrefs] = useState(false)

  const load = () => {
    setLoading(true)
    recommendationApi.get()
      .then(setRecs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>For You</h2>
          <p>Recipes scored based on your history and preferences.</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowPrefs(true)}>⚙ Preferences</button>
      </div>

      {loading ? (
        <div className="recipe-page-loading">Calculating recommendations...</div>
      ) : recs.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <h2>No recommendations yet</h2>
          <p>Mark a few recipes as eaten to get personalised suggestions.</p>
        </div>
      ) : (
        <div className="rec-list">
          {recs.map(recipe => (
            <div
              key={recipe.id}
              className="rec-card"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/recipe/${recipe.id}`)}
            >
              <div className="rec-info">
                <span className="rec-name">{recipe.name}</span>
                <span className="rec-meta">
                  {recipe.dietaryType?.replace('_', ' ')}
                  {recipe.dietaryType && recipe.cuisineType && ' · '}
                  {recipe.cuisineType}
                </span>
              </div>
              <div className="rec-score-badge">
                <span className="rec-score-label">Score</span>
                <span className="rec-score-value">{recipe.score.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPrefs && (
        <PreferencesModal
          onClose={() => { setShowPrefs(false); load() }}
        />
      )}
    </div>
  )
}
