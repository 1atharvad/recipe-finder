import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkle, Sliders, Trophy } from '@phosphor-icons/react'
import { recommendationApi } from '@/api/api'
import type { RecommendationDTO } from '@/types'
import { PreferencesModal } from '@/components/PreferencesModal'
import content from '@/content/recommenderPage.json'

export const RecommenderPage = () => {
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
    <section className="recommender-page">
      <div className="recommender-header">
        <div>
          <span className="hero-eyebrow">{content.eyebrow} <Sparkle weight="fill" /></span>
          <h1>{content.title}</h1>
          <p>{content.text}</p>
        </div>
        <button className="btn-pill btn-small btn-icon-only" onClick={() => setShowPrefs(true)} aria-label={content.preferencesLabel}>
          <Sliders weight="bold" />
        </button>
      </div>

      {loading ? (
        <div className="recipe-page-loading">{content.loadingLabel}</div>
      ) : recs.length === 0 ? (
        <div className="empty-state">
          <Sparkle weight="fill" className="empty-icon-svg" />
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
        </div>
      ) : (
        <div className="rec-list">
          {recs.map((recipe, i) => (
            <button
              key={recipe.id}
              className="rec-card"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              {i === 0 && (
                <span className="rec-top-badge"><Trophy weight="fill" /> {content.topPickLabel}</span>
              )}
              <div className="rec-info">
                <span className="rec-name">{recipe.name}</span>
                <div className="rec-tags">
                  {recipe.dietaryType && (
                    <span className="meta-badge tone-sage">{recipe.dietaryType.replace('_', ' ')}</span>
                  )}
                  {recipe.cuisineType && (
                    <span className="meta-badge tone-mustard">{recipe.cuisineType}</span>
                  )}
                </div>
              </div>
              <div className="rec-score-badge">
                <span className="rec-score-label">{content.scoreLabel}</span>
                <span className="rec-score-value">{recipe.score.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showPrefs && (
        <PreferencesModal
          onClose={() => { setShowPrefs(false); load() }}
        />
      )}
    </section>
  )
}
