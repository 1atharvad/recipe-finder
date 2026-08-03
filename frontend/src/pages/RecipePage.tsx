import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon, HeartIcon, CheckCircleIcon, UsersIcon, ListChecksIcon, ForkKnifeIcon,
  PrinterIcon, ShareNetworkIcon, ClockCounterClockwiseIcon, PlayCircleIcon, TimerIcon, BellRingingIcon,
} from '@phosphor-icons/react'
import { toast } from 'advi-ui'
import { recipeApi, favoritesApi, historyApi, scheduleApi } from '@/api/api'
import { useAuth } from '@/context/AuthContext'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { RecipeCard } from '@/components/RecipeCard'
import { MarkEatenModal } from '@/components/MarkEatenModal'
import { ScheduleModal } from '@/components/ScheduleModal'
import { SkelBlock } from '@/components/Skeleton'
import { getRecipeImage, handleImageFallback, getYouTubeEmbedUrl } from '@/assets/global-functions'
import type { Recipe, EatingHistoryEntry } from '@/types'
import content from '@/content/recipePage.json'

export const RecipePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [favorited, setFavorited] = useState(false)
  const [eatenMsg, setEatenMsg] = useState('')
  const [cookHistory, setCookHistory] = useState<EatingHistoryEntry[]>([])
  const [similar, setSimilar] = useState<Recipe[]>([])
  const [shareMsg, setShareMsg] = useState('')
  const [showMarkEaten, setShowMarkEaten] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledMsg, setScheduledMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    recipeApi.getById(Number(id))
      .then(data => {
        if (cancelled) return
        setRecipe(data)
        setStatus('done')
      })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !recipe) return
    favoritesApi.getAll()
      .then(favs => setFavorited(favs.some(f => f.id === recipe.id)))
      .catch(() => {})
    historyApi.getForRecipe(recipe.id)
      .then(setCookHistory)
      .catch(() => {})
  }, [isAuthenticated, recipe])

  useEffect(() => {
    if (!recipe) return
    recipeApi.getTop()
      .then(top => setSimilar(
        top.filter(r =>
          r.id !== recipe.id &&
          (r.cuisineType === recipe.cuisineType || r.dietaryType === recipe.dietaryType)
        ).slice(0, 3)
      ))
      .catch(() => {})
  }, [recipe])

  const toggleFavorite = async () => {
    if (!recipe) return
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      if (favorited) {
        await favoritesApi.remove(recipe.id)
        setFavorited(false)
      } else {
        await favoritesApi.add(recipe.id)
        setFavorited(true)
      }
    } catch { toast.error(content.actionErrorMessage) }
  }

  const markEaten = async (eatenAt: string) => {
    if (!recipe) return
    setShowMarkEaten(false)
    try {
      const entry = await historyApi.markEaten(recipe.id, eatenAt)
      setEatenMsg(content.markedEatenLabel)
      setCookHistory(prev => [entry, ...prev])
      setTimeout(() => setEatenMsg(''), 2000)
    } catch { toast.error(content.actionErrorMessage) }
  }

  const schedule = async (scheduledAt: string, note: string) => {
    if (!recipe) return
    setShowSchedule(false)
    try {
      await scheduleApi.create(recipe.id, scheduledAt, note)
      setScheduledMsg(content.scheduledLabel)
      setTimeout(() => setScheduledMsg(''), 2000)
    } catch { toast.error(content.actionErrorMessage) }
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: recipe?.name, url }) } catch {}
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMsg(content.linkCopiedLabel)
      setTimeout(() => setShareMsg(''), 2000)
    } catch { toast.error(content.actionErrorMessage) }
  }

  if (status === 'loading') {
    return (
      <div className="landing">
        <LandingHeader />
        <div className="recipe-page">
          <SkelBlock width="6rem" height="1rem" />
          <article className="recipe-card-detail">
            <SkelBlock radius={0} className="recipe-hero-img" />
            <header className="book-header">
              <div className="book-title-row">
                <div>
                  <SkelBlock width="16rem" height="2rem" />
                  <SkelBlock width="8rem" height="0.9rem" />
                </div>
                <div className="book-actions">
                  <SkelBlock width="5rem" height="2.25rem" radius="999px" />
                  <SkelBlock width="5rem" height="2.25rem" radius="999px" />
                </div>
              </div>
              <div className="book-meta">
                <SkelBlock width="6rem" height="1.6rem" radius="999px" />
                <SkelBlock width="5rem" height="1.6rem" radius="999px" />
                <SkelBlock width="5rem" height="1.6rem" radius="999px" />
              </div>
            </header>

            <div className="book-body">
              <section className="ingredients-section">
                <h2><SkelBlock width="8rem" height="1.1rem" /></h2>
                <ul className="ingredients-list">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i}>
                      <SkelBlock width="3.5rem" height="0.9rem" />
                      <SkelBlock width="9rem" height="0.9rem" />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="steps-section">
                <h2><SkelBlock width="8rem" height="1.1rem" /></h2>
                <ol className="steps-list">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i}>
                      <SkelBlock width="30px" height="30px" radius="50%" />
                      <SkelBlock width="90%" height="0.9rem" />
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </article>

          <section className="similar-recipes">
            <p className="section-label"><SkelBlock width="9rem" height="0.85rem" /></p>
            <div className="recipe-list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="recipe-card">
                  <SkelBlock width="60%" height="0.95rem" />
                </div>
              ))}
            </div>
          </section>
        </div>
        <LandingFooter />
      </div>
    )
  }

  if (status === 'error' || !recipe) {
    return (
      <div className="landing">
        <LandingHeader />
        <div className="recipe-page-error">
          <p>{content.notFoundLabel}</p>
          <button className="btn-pill btn-primary btn-small" onClick={() => navigate('/dashboard/search')}>
            {content.backToSearchLabel}
          </button>
        </div>
        <LandingFooter />
      </div>
    )
  }

  const embedUrl = recipe.videoUrl ? getYouTubeEmbedUrl(recipe.videoUrl) : null

  return (
    <div className="landing">
      <LandingHeader />

      <div className="recipe-page">
        <button className="btn-link back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftIcon weight="bold" /> {content.backLabel}
        </button>

        <article className="recipe-card-detail">
          <img
            className="recipe-hero-img"
            src={getRecipeImage(recipe.imageUrl)}
            alt={recipe.name}
            onError={handleImageFallback}
          />

          <header className="book-header">
            <div className="book-title-row">
              <div>
                <h1 className="book-title">{recipe.name}</h1>
                {recipe.owner && (
                  <p className="book-owner">{content.byPrefix} {recipe.owner.firstName}</p>
                )}
                {recipe.sourceName && (
                  <p className="book-source">
                    {content.adaptedFromPrefix}{' '}
                    {recipe.sourceUrl
                      ? <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">{recipe.sourceName}</a>
                      : recipe.sourceName}
                  </p>
                )}
              </div>
              <div className="book-actions">
                <button
                  className={`btn-pill btn-small ${favorited ? 'btn-save saved' : 'btn-save'}`}
                  onClick={toggleFavorite}
                >
                  <HeartIcon weight={favorited ? 'fill' : 'bold'} /> {favorited ? content.savedLabel : content.saveLabel}
                </button>
                {isAuthenticated && (
                  <button className="btn-pill btn-small btn-eaten" onClick={() => setShowMarkEaten(true)}>
                    <CheckCircleIcon weight="bold" /> {eatenMsg || content.markEatenLabel}
                  </button>
                )}
                {isAuthenticated && (
                  <button className="btn-pill btn-small btn-schedule" onClick={() => setShowSchedule(true)}>
                    <BellRingingIcon weight="bold" /> {scheduledMsg || content.scheduleLabel}
                  </button>
                )}
                <button className="btn-pill btn-small btn-icon-only" onClick={share} aria-label={content.shareLabel}>
                  <ShareNetworkIcon weight="bold" />
                </button>
                <button className="btn-pill btn-small btn-icon-only" onClick={() => window.print()} aria-label={content.printLabel}>
                  <PrinterIcon weight="bold" />
                </button>
              </div>
            </div>
            {shareMsg && <p className="share-msg">{shareMsg}</p>}
            <div className="book-meta">
              <span className="meta-chip"><UsersIcon weight="bold" /> {content.servesPrefix} {recipe.servings} {recipe.servings === 1 ? content.personSingular : content.personPlural}</span>
              <span className="meta-chip"><ListChecksIcon weight="bold" /> {recipe.steps.length} {content.stepsSuffix}</span>
              <span className="meta-chip"><ForkKnifeIcon weight="bold" /> {recipe.ingredients.length} {content.ingredientsSuffix}</span>
              {(recipe.prepTimeMinutes != null || recipe.cookTimeMinutes != null) && (
                <span className="meta-chip">
                  <TimerIcon weight="bold" />
                  {recipe.prepTimeMinutes != null && `${recipe.prepTimeMinutes}m ${content.prepLabel}`}
                  {recipe.prepTimeMinutes != null && recipe.cookTimeMinutes != null && ' + '}
                  {recipe.cookTimeMinutes != null && `${recipe.cookTimeMinutes}m ${content.cookLabel}`}
                </span>
              )}
              {recipe.dietaryType && (
                <span className="meta-badge tone-sage">{recipe.dietaryType.replace('_', ' ')}</span>
              )}
              {recipe.cuisineType && (
                <span className="meta-badge tone-mustard">{recipe.cuisineType}</span>
              )}
              {recipe.difficulty && (
                <span className="meta-badge tone-peach">{recipe.difficulty}</span>
              )}
            </div>

            {cookHistory.length > 0 && (
              <p className="cook-history-note">
                <ClockCounterClockwiseIcon weight="bold" /> {content.cookedPrefix} {cookHistory.length} {cookHistory.length !== 1 ? content.timePlural : content.timeSingular}
                {' '}{content.lastOnPrefix} {new Date(cookHistory[0].eatenOn).toLocaleDateString()}.
              </p>
            )}
          </header>

          <div className="book-body">
            <section className="ingredients-section">
              <h2>{content.ingredientsTitle}</h2>
              <ul className="ingredients-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>
                    <span className="ing-quantity">{ing.quantity}</span>
                    <span className="ing-name">{ing.name}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="steps-section">
              <h2>{content.instructionsTitle}</h2>
              <ol className="steps-list">
                {recipe.steps.map((step, i) => (
                  <li key={i}>
                    <span className="step-number">{i + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            {(recipe.calories != null || recipe.proteinGrams != null || recipe.carbsGrams != null || recipe.fatGrams != null
              || recipe.fiberGrams != null || recipe.sugarGrams != null || recipe.sodiumMg != null) && (
              <section className="nutrition-section">
                <h2>{content.nutritionTitle}</h2>
                <p className="nutrition-subtext">{content.nutritionSubtext}</p>
                <div className="nutrition-stats">
                  {recipe.calories != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{recipe.calories}</span>
                      <span className="nutrition-stat-label">{content.caloriesLabel}</span>
                    </div>
                  )}
                  {recipe.proteinGrams != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{recipe.proteinGrams}g</span>
                      <span className="nutrition-stat-label">{content.proteinLabel}</span>
                    </div>
                  )}
                  {recipe.carbsGrams != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{recipe.carbsGrams}g</span>
                      <span className="nutrition-stat-label">{content.carbsLabel}</span>
                    </div>
                  )}
                  {recipe.fatGrams != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{recipe.fatGrams}g</span>
                      <span className="nutrition-stat-label">{content.fatLabel}</span>
                    </div>
                  )}
                  {recipe.fiberGrams != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{recipe.fiberGrams}g</span>
                      <span className="nutrition-stat-label">{content.fiberLabel}</span>
                    </div>
                  )}
                  {recipe.sugarGrams != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{recipe.sugarGrams}g</span>
                      <span className="nutrition-stat-label">{content.sugarLabel}</span>
                    </div>
                  )}
                  {recipe.sodiumMg != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-stat-value">{recipe.sodiumMg}mg</span>
                      <span className="nutrition-stat-label">{content.sodiumLabel}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {embedUrl && (
              <section className="video-section">
                <h2><PlayCircleIcon weight="bold" /> {content.watchItMadeTitle}</h2>
                <div className="video-embed">
                  <iframe
                    src={embedUrl}
                    title={`${recipe.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}
          </div>
        </article>

        {similar.length > 0 && (
          <section className="similar-recipes">
            <p className="section-label">{content.similarRecipesLabel}</p>
            <div className="recipe-list">
              {similar.map(r => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </section>
        )}
      </div>

      <LandingFooter />

      {showMarkEaten && (
        <MarkEatenModal onConfirm={markEaten} onClose={() => setShowMarkEaten(false)} />
      )}
      {showSchedule && (
        <ScheduleModal recipeName={recipe.name} onConfirm={schedule} onClose={() => setShowSchedule(false)} />
      )}
    </div>
  )
}
