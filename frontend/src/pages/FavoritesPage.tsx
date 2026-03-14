import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { favoritesApi } from '../api/api'
import { RecipeCard } from '../components/RecipeCard'
import type { Recipe } from '../types'

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    favoritesApi.getAll()
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id: number) => {
    try {
      await favoritesApi.remove(id)
      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch {}
  }

  if (loading) return <div className="recipe-page-loading">Loading favorites...</div>

  if (favorites.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-icon">♡</span>
          <h2>No saved recipes yet</h2>
          <p>Open any recipe and save the ones you like.</p>
          <Link to="/" className="btn-primary">Browse Recipes</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Saved Recipes</h2>
        <p>{favorites.length} recipe{favorites.length > 1 ? 's' : ''} saved</p>
      </div>
      <div className="recipe-list">
        {favorites.map((recipe, i) => (
          <div key={recipe.id} className="fav-row">
            <RecipeCard recipe={recipe} index={i} />
            <button className="remove-btn" onClick={() => handleRemove(recipe.id)} title="Remove">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
