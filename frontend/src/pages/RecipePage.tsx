import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recipeApi, favoritesApi, historyApi } from '../api/api'
import { useAuth } from '../context/AuthContext'
import type { Recipe } from '../types'

export const RecipePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [favorited, setFavorited] = useState(false)
  const [eatenMsg, setEatenMsg] = useState('')

  useEffect(() => {
    recipeApi.getById(Number(id))
      .then(data => { setRecipe(data); setStatus('done') })
      .catch(() => setStatus('error'))
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !recipe) return
    favoritesApi.getAll()
      .then(favs => setFavorited(favs.some(f => f.id === recipe.id)))
      .catch(() => {})
  }, [isAuthenticated, recipe])

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
      await historyApi.markEaten(recipe.id)
      setEatenMsg('Marked as eaten!')
      setTimeout(() => setEatenMsg(''), 2000)
    } catch {}
  }

  if (status === 'loading') return <div className="recipe-page-loading">Loading recipe...</div>
  if (status === 'error' || !recipe) return (
    <div className="recipe-page-error">
      <p>Recipe not found.</p>
      <button onClick={() => navigate('/')}>← Back to Search</button>
    </div>
  )

  return (
    <div className="recipe-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <article className="recipe-book">
        <header className="book-header">
          <div className="book-title-row">
            <h1 className="book-title">{recipe.name}</h1>
            <div className="book-actions">
              <button
                className={favorited ? 'btn-save saved' : 'btn-save'}
                onClick={toggleFavorite}
              >
                {favorited ? '♥ Saved' : '♡ Save Recipe'}
              </button>
              {isAuthenticated && (
                <button className="btn-eaten" onClick={markEaten}>
                  {eatenMsg || '✓ Mark as Eaten'}
                </button>
              )}
            </div>
          </div>
          <div className="book-meta">
            <span>Serves {recipe.servings} {recipe.servings === 1 ? 'person' : 'people'}</span>
            <span className="meta-dot">·</span>
            <span>{recipe.steps.length} steps</span>
            <span className="meta-dot">·</span>
            <span>{recipe.ingredients.length} ingredients</span>
            {recipe.dietaryType && (
              <>
                <span className="meta-dot">·</span>
                <span className="meta-badge">{recipe.dietaryType.replace('_', ' ')}</span>
              </>
            )}
            {recipe.cuisineType && (
              <>
                <span className="meta-dot">·</span>
                <span className="meta-badge">{recipe.cuisineType}</span>
              </>
            )}
          </div>
          <div className="book-divider" />
        </header>

        <div className="book-body">
          <section className="ingredients-section">
            <h2>Ingredients</h2>
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
            <h2>Instructions</h2>
            <ol className="steps-list">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="step-number">{i + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </div>
  )
}
