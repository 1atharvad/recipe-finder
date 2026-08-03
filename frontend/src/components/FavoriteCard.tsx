import { useNavigate } from 'react-router-dom'
import { HeartIcon, UsersIcon, TimerIcon } from '@phosphor-icons/react'
import { getRecipeImage, handleImageFallback } from '@/assets/global-functions'
import type { Recipe } from '@/types'
import content from '@/content/favoritesPage.json'

interface Props {
  recipe: Recipe
  onRemove: (id: number) => void
}

export const FavoriteCard = ({ recipe, onRemove }: Props) => {
  const navigate = useNavigate()
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)

  return (
    <div className="favorite-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <div className="favorite-card-img-wrap">
        <img
          src={getRecipeImage(recipe.imageUrl)}
          alt={recipe.name}
          loading="lazy"
          onError={handleImageFallback}
        />
        {recipe.cuisineType && <span className="meta-badge tone-mustard favorite-card-badge">{recipe.cuisineType}</span>}
        <button
          className="favorite-remove-btn"
          onClick={e => { e.stopPropagation(); onRemove(recipe.id) }}
          aria-label={content.removeLabel}
          title={content.removeLabel}
        >
          <HeartIcon weight="fill" />
        </button>
      </div>
      <div className="favorite-card-body">
        <span className="favorite-card-name">{recipe.name}</span>
        <div className="favorite-card-meta">
          <span><UsersIcon weight="bold" /> {recipe.servings}</span>
          {totalTime > 0 && <span><TimerIcon weight="bold" /> {totalTime}m</span>}
          {recipe.dietaryType && <span className="favorite-card-dietary">{recipe.dietaryType.replace('_', ' ')}</span>}
        </div>
      </div>
    </div>
  )
}
