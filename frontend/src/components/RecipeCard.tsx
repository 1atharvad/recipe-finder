import { useNavigate } from 'react-router-dom'

interface Recipe {
  id: number
  name: string
}

interface Props {
  recipe: Recipe
  index?: number
}

export const RecipeCard = ({ recipe, index }: Props) => {
  const navigate = useNavigate()

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      {index !== undefined && <span className="card-index">{index + 1}</span>}
      <span className="card-name">{recipe.name}</span>
      <span className="card-arrow">→</span>
    </div>
  )
}
