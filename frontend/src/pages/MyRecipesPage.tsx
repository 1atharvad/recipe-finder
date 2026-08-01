import { useEffect, useState } from 'react'
import { recipeApi } from '@/api/api'
import type { Recipe } from '@/types'
import { RecipeFormModal } from '@/components/RecipeFormModal'
import content from '@/content/myRecipesPage.json'

export const MyRecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Recipe | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = () => {
    recipeApi.getMyRecipes()
      .then(setRecipes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: number) => {
    if (!confirm(content.deleteConfirm)) return
    try {
      await recipeApi.deleteMine(id)
      setRecipes(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  const handleSaved = (recipe: Recipe) => {
    setRecipes(prev => {
      const idx = prev.findIndex(r => r.id === recipe.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = recipe
        return next
      }
      return [recipe, ...prev]
    })
    setEditTarget(null)
    setShowCreate(false)
  }

  if (loading) return <div className="recipe-page-loading">{content.loadingLabel}</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{content.title}</h2>
          <p>{recipes.length} {content.countWord}{recipes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>{content.addRecipeLabel}</button>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">{content.emptyIcon}</span>
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>{content.addRecipeEmptyLabel}</button>
        </div>
      ) : (
        <div className="my-recipes-list">
          {recipes.map(recipe => (
            <div key={recipe.id} className="my-recipe-row">
              <div className="my-recipe-info">
                <span className="my-recipe-name">
                  {recipe.name}
                  <span className={`visibility-badge ${recipe.isPublic ? 'is-public' : 'is-private'}`}>
                    {recipe.isPublic ? content.publicLabel : content.privateLabel}
                  </span>
                </span>
                <span className="my-recipe-meta">
                  {recipe.servings} {content.servingWord}{recipe.servings !== 1 ? 's' : ''}
                  {recipe.dietaryType && ` · ${recipe.dietaryType.replace('_', ' ')}`}
                  {recipe.cuisineType && ` · ${recipe.cuisineType}`}
                </span>
              </div>
              <div className="my-recipe-actions">
                <button className="btn-edit" onClick={() => setEditTarget(recipe)}>{content.editLabel}</button>
                <button className="btn-delete" onClick={() => handleDelete(recipe.id)}>{content.deleteLabel}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <RecipeFormModal
          mode="create"
          context="user"
          onSave={handleSaved}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <RecipeFormModal
          mode="edit"
          context="user"
          initial={editTarget}
          onSave={handleSaved}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
