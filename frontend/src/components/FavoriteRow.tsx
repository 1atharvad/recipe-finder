import { useNavigate } from 'react-router-dom'
import { HeartIcon, UsersIcon } from '@phosphor-icons/react'
import { getRecipeImage, handleImageFallback } from '@/assets/global-functions'
import type { Recipe } from '@/types'
import content from '@/content/favoritesPage.json'

interface Props {
  recipe: Recipe
  onRemove: (id: number) => void
}

export const FavoriteRow = ({ recipe, onRemove }: Props) => {
  const navigate = useNavigate()

  return (
    <div className="favorite-row" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <img
        src={getRecipeImage(recipe.imageUrl)}
        alt={recipe.name}
        className="favorite-row-img"
        loading="lazy"
        onError={handleImageFallback}
      />
      <div className="favorite-row-info">
        <span className="favorite-row-name">{recipe.name}</span>
        <span className="favorite-row-meta">
          <UsersIcon weight="bold" /> {recipe.servings}
          {recipe.cuisineType && ` · ${recipe.cuisineType}`}
          {recipe.dietaryType && ` · ${recipe.dietaryType.replace('_', ' ')}`}
        </span>
      </div>
      <button
        className="favorite-row-remove"
        onClick={e => { e.stopPropagation(); onRemove(recipe.id) }}
        aria-label={content.removeLabel}
        title={content.removeLabel}
      >
        <HeartIcon weight="fill" />
      </button>
    </div>
  )
}
