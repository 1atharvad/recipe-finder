import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon } from '@phosphor-icons/react'
import { favoritesApi } from '@/api/api'
import { FavoriteCard } from '@/components/FavoriteCard'
import { FavoriteRow } from '@/components/FavoriteRow'
import { SkelBlock } from '@/components/Skeleton'
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
    const prev = favorites
    setFavorites(f => f.filter(r => r.id !== id))
    try {
      await favoritesApi.remove(id)
    } catch {
      setFavorites(prev)
    }
  }

  if (loading) return <FavoritesPageSkeleton />

  if (favorites.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <HeartIcon weight="fill" className="empty-icon-svg" />
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
          <Link to="/dashboard" className="btn-pill btn-primary">{content.browseLabel}</Link>
        </div>
      </div>
    )
  }

  // Most recently favorited (backend orders by savedAt desc) get featured
  // treatment; everything else is a compact scan-friendly row list.
  const top = favorites.slice(0, 3)
  const rest = favorites.slice(3)

  return (
    <div className="page">
      <div className="hero-page-header">
        <div>
          <span className="hero-eyebrow">
            <HeartIcon weight="fill" /> {favorites.length} {content.countWord}{favorites.length > 1 ? 's' : ''} {content.countSuffix}
          </span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
      </div>

      {/* Desktop: top 3 get featured cards, the rest are compact rows. */}
      <div className="favorites-desktop-view">
        <p className="section-label">{content.topSectionLabel}</p>
        <div className="favorites-grid">
          {top.map(recipe => (
            <FavoriteCard key={recipe.id} recipe={recipe} onRemove={handleRemove} />
          ))}
        </div>

        {rest.length > 0 && (
          <>
            <p className="section-label">{content.restSectionLabel}</p>
            <div className="favorites-row-list">
              {rest.map(recipe => (
                <FavoriteRow key={recipe.id} recipe={recipe} onRemove={handleRemove} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile: no separate "featured" treatment — every favorite is the
          same compact row, full width is too tight for the image-forward card. */}
      <div className="favorites-row-list favorites-mobile-view">
        {favorites.map(recipe => (
          <FavoriteRow key={recipe.id} recipe={recipe} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  )
}

const FavoritesPageSkeleton = () => (
  <div className="page">
    <div className="hero-page-header">
      <div>
        <SkelBlock width="8rem" height="0.9rem" />
        <SkelBlock width="12rem" height="1.8rem" />
        <SkelBlock width="16rem" height="1rem" />
      </div>
    </div>

    <div className="favorites-desktop-view">
      <SkelBlock className="section-label" width="6rem" height="0.9rem" />
      <div className="favorites-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="favorite-card">
            <div className="favorite-card-img-wrap"><SkelBlock height="100%" radius={0} /></div>
            <div className="favorite-card-body">
              <SkelBlock width="80%" height="1rem" />
              <SkelBlock width="50%" height="0.8rem" />
            </div>
          </div>
        ))}
      </div>

      <SkelBlock className="section-label" width="6rem" height="0.9rem" />
      <div className="favorites-row-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="favorite-row">
            <SkelBlock className="favorite-row-img" height="52px" />
            <div className="favorite-row-info">
              <SkelBlock width="60%" height="0.92rem" />
              <SkelBlock width="40%" height="0.78rem" />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="favorites-row-list favorites-mobile-view">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="favorite-row">
          <SkelBlock className="favorite-row-img" height="52px" />
          <div className="favorite-row-info">
            <SkelBlock width="60%" height="0.92rem" />
            <SkelBlock width="40%" height="0.78rem" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
