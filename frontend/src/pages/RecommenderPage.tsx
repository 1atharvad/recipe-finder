import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SparkleIcon, SlidersIcon, TrophyIcon } from '@phosphor-icons/react'
import { recommendationApi } from '@/api/api'
import type { RecommendationDTO } from '@/types'
import { PreferencesModal } from '@/components/PreferencesModal'
import { SkelBlock } from '@/components/Skeleton'
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
          <span className="hero-eyebrow">{content.eyebrow} <SparkleIcon weight="fill" /></span>
          <h1>{content.title}</h1>
          <p>{content.text}</p>
        </div>
        <button className="btn-pill btn-small btn-icon-only" onClick={() => setShowPrefs(true)} aria-label={content.preferencesLabel}>
          <SlidersIcon weight="bold" />
        </button>
      </div>

      {loading ? (
        <div className="rec-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rec-card">
              <div className="rec-info">
                <SkelBlock width="10rem" height="1.1rem" />
                <div className="rec-tags">
                  <SkelBlock width="4rem" height="1.3rem" radius="999px" />
                  <SkelBlock width="4rem" height="1.3rem" radius="999px" />
                </div>
              </div>
              <div className="rec-score-badge">
                <SkelBlock width="2.5rem" height="0.7rem" />
                <SkelBlock width="2rem" height="1rem" />
              </div>
            </div>
          ))}
        </div>
      ) : recs.length === 0 ? (
        <div className="empty-state">
          <SparkleIcon weight="fill" className="empty-icon-svg" />
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
                <span className="rec-top-badge"><TrophyIcon weight="fill" /> {content.topPickLabel}</span>
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
