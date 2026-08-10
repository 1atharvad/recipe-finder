import { useNavigate } from 'react-router-dom'
import type { Recipe } from '@/types'
import content from '@/content/recipeCard.json'

interface Props {
  recipe: Pick<Recipe, 'id' | 'name'>
  index?: number
  onClick?: () => void
}

export const RecipeCard = ({ recipe, index, onClick }: Props) => {
  const navigate = useNavigate()

  return (
    <div className="recipe-card" onClick={() => { onClick?.(); navigate(`/recipe/${recipe.id}`) }}>
      {index !== undefined && <span className="card-index">{index + 1}</span>}
      <span className="card-name">{recipe.name}</span>
      <span className="card-arrow">{content.arrow}</span>
    </div>
  )
}
