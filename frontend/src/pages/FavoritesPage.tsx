import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { favoritesApi } from '@/api/api'
import { RecipeCard } from '@/components/RecipeCard'
import type { Recipe } from '@/types'
import content from '@/content/favoritesPage.json'

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

  if (loading) return <div className="recipe-page-loading">{content.loadingLabel}</div>

  if (favorites.length === 0) {
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

  return (
    <div className="page">
      <div className="page-header">
        <h2>{content.title}</h2>
        <p>{favorites.length} {content.countWord}{favorites.length > 1 ? 's' : ''} {content.countSuffix}</p>
      </div>
      <div className="recipe-list">
        {favorites.map((recipe, i) => (
          <div key={recipe.id} className="fav-row">
            <RecipeCard recipe={recipe} index={i} />
            <button className="remove-btn" onClick={() => handleRemove(recipe.id)} title={content.removeLabel}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
