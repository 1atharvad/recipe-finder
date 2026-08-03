import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotePencilIcon } from '@phosphor-icons/react'
import { toast } from 'advi-ui'
import { recipeApi } from '@/api/api'
import type { Recipe } from '@/types'
import { RecipeFormModal } from '@/components/RecipeFormModal'
import { SkelBlock } from '@/components/Skeleton'
import content from '@/content/myRecipesPage.json'

export const MyRecipesPage = () => {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Recipe | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = () => {
    recipeApi.getMyRecipes()
      .then(setRecipes)
      .catch(() => toast.error(content.loadErrorMessage))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: number) => {
    if (!confirm(content.deleteConfirm)) return
    try {
      await recipeApi.deleteMine(id)
      setRecipes(prev => prev.filter(r => r.id !== id))
    } catch {
      toast.error(content.deleteErrorMessage)
    }
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

  if (loading) return <MyRecipesPageSkeleton />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{content.title}</h2>
          <p>{recipes.length} {content.countWord}{recipes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-pill btn-primary" onClick={() => setShowCreate(true)}>{content.addRecipeLabel}</button>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <NotePencilIcon weight="fill" className="empty-icon-svg" />
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
          <button className="btn-pill btn-primary" onClick={() => setShowCreate(true)}>{content.addRecipeEmptyLabel}</button>
        </div>
      ) : (
        <div className="my-recipes-list">
          {recipes.map(recipe => (
            <div key={recipe.id} className="my-recipe-row">
              <div className="my-recipe-info" onClick={() => navigate(`/recipe/${recipe.id}`)}>
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
                <button className="btn-pill btn-small btn-edit" onClick={e => { e.stopPropagation(); setEditTarget(recipe) }}>{content.editLabel}</button>
                <button className="btn-pill btn-small btn-delete" onClick={e => { e.stopPropagation(); handleDelete(recipe.id) }}>{content.deleteLabel}</button>
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

const MyRecipesPageSkeleton = () => (
  <div className="page">
    <div className="page-header">
      <div>
        <h2><SkelBlock width="9rem" /></h2>
        <p><SkelBlock width="6rem" /></p>
      </div>
      <SkelBlock width="8rem" height="2.25rem" radius="999px" />
    </div>
    <div className="my-recipes-list">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="my-recipe-row">
          <div className="my-recipe-info">
            <SkelBlock width="12rem" height="1rem" />
            <SkelBlock width="8rem" height="0.8rem" />
          </div>
          <div className="my-recipe-actions">
            <SkelBlock width="4rem" height="1.8rem" radius="999px" />
            <SkelBlock width="4rem" height="1.8rem" radius="999px" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
