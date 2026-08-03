import { useNavigate } from 'react-router-dom'
import { handleImageFallback, getRecipeImage } from '@/assets/global-functions'

interface Recipe {
  id: number
  name: string
  imageUrl?: string | null
}

interface Props {
  recipes: Recipe[]
}

export const BentoGrid = ({ recipes }: Props) => {
  const navigate = useNavigate()
  const items = recipes.slice(0, 6)

  return (
    <div className="bento-grid">
      {items.map((recipe, i) => (
        <div
          key={recipe.id}
          className={`bento-item bento-item-${i}`}
          onClick={() => navigate(`/recipe/${recipe.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(`/recipe/${recipe.id}`)}
          aria-label={recipe.name}
        >
          <img
            src={getRecipeImage(recipe.imageUrl)}
            alt={recipe.name}
            className="bento-img"
            loading="lazy"
            onError={handleImageFallback}
          />
          <div className="bento-overlay" />
          <span className="bento-name">{recipe.name}</span>
        </div>
      ))}
    </div>
  )
}
