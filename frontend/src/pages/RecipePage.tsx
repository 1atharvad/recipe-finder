import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Heart, CheckCircle, Users, ListChecks, ForkKnife,
  Printer, ShareNetwork, ClockCounterClockwise, PlayCircle,
} from '@phosphor-icons/react'
import { recipeApi, favoritesApi, historyApi } from '@/api/api'
import { useAuth } from '@/context/AuthContext'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { RecipeCard } from '@/components/RecipeCard'
import { getRecipeImage } from '@/assets/recipeImages'
import { handleImageFallback } from '@/assets/imageFallback'
import { getYouTubeEmbedUrl } from '@/assets/youtube'
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

  useEffect(() => {
    setStatus('loading')
    recipeApi.getById(Number(id))
      .then(data => { setRecipe(data); setStatus('done') })
      .catch(() => setStatus('error'))
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
    } catch {}
  }

  const markEaten = async () => {
    if (!recipe) return
    try {
      const entry = await historyApi.markEaten(recipe.id)
      setEatenMsg(content.markedEatenLabel)
      setCookHistory(prev => [entry, ...prev])
      setTimeout(() => setEatenMsg(''), 2000)
    } catch {}
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
    } catch {}
  }

  if (status === 'loading') {
    return (
      <div className="landing">
        <LandingHeader />
        <div className="recipe-page-loading">{content.loadingLabel}</div>
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
          <ArrowLeft weight="bold" /> {content.backLabel}
        </button>

        <article className="recipe-card-detail">
          <img
            className="recipe-hero-img"
            src={getRecipeImage(recipe.name, true)}
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
              </div>
              <div className="book-actions">
                <button
                  className={`btn-pill btn-small ${favorited ? 'btn-save saved' : 'btn-save'}`}
                  onClick={toggleFavorite}
                >
                  <Heart weight={favorited ? 'fill' : 'bold'} /> {favorited ? content.savedLabel : content.saveLabel}
                </button>
                {isAuthenticated && (
                  <button className="btn-pill btn-small btn-eaten" onClick={markEaten}>
                    <CheckCircle weight="bold" /> {eatenMsg || content.markEatenLabel}
                  </button>
                )}
                <button className="btn-pill btn-small btn-icon-only" onClick={share} aria-label={content.shareLabel}>
                  <ShareNetwork weight="bold" />
                </button>
                <button className="btn-pill btn-small btn-icon-only" onClick={() => window.print()} aria-label={content.printLabel}>
                  <Printer weight="bold" />
                </button>
              </div>
            </div>
            {shareMsg && <p className="share-msg">{shareMsg}</p>}
            <div className="book-meta">
              <span className="meta-chip"><Users weight="bold" /> {content.servesPrefix} {recipe.servings} {recipe.servings === 1 ? content.personSingular : content.personPlural}</span>
              <span className="meta-chip"><ListChecks weight="bold" /> {recipe.steps.length} {content.stepsSuffix}</span>
              <span className="meta-chip"><ForkKnife weight="bold" /> {recipe.ingredients.length} {content.ingredientsSuffix}</span>
              {recipe.dietaryType && (
                <span className="meta-badge tone-sage">{recipe.dietaryType.replace('_', ' ')}</span>
              )}
              {recipe.cuisineType && (
                <span className="meta-badge tone-mustard">{recipe.cuisineType}</span>
              )}
            </div>

            {cookHistory.length > 0 && (
              <p className="cook-history-note">
                <ClockCounterClockwise weight="bold" /> {content.cookedPrefix} {cookHistory.length} {cookHistory.length !== 1 ? content.timePlural : content.timeSingular}
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

            {embedUrl && (
              <section className="video-section">
                <h2><PlayCircle weight="bold" /> {content.watchItMadeTitle}</h2>
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
    </div>
  )
}
