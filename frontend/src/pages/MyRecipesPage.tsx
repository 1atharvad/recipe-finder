import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotePencilIcon, DotsThreeVerticalIcon } from '@phosphor-icons/react'
import { toast, Badge } from 'advi-ui'
import { recipeApi } from '@/api/api'
import { getRecipeImage, handleImageFallback } from '@/assets/global-functions'
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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

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
      <div className="hero-page-header">
        <div>
          <span className="hero-eyebrow">
            <NotePencilIcon weight="fill" /> {recipes.length} {content.countWord}{recipes.length !== 1 ? 's' : ''}
          </span>
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
        <button className="btn-pill btn-primary btn-small" onClick={() => setShowCreate(true)}>{content.addRecipeLabel}</button>
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
            <div key={recipe.id} className="my-recipe-row" onClick={() => navigate(`/recipe/${recipe.id}`)}>
              <img
                src={getRecipeImage(recipe.imageUrl)}
                alt={recipe.name}
                className="my-recipe-img"
                loading="lazy"
                onError={handleImageFallback}
              />
              <div className="my-recipe-info">
                <span className="my-recipe-name">
                  {recipe.name}
                  <Badge className={`visibility-badge ${recipe.isPublic ? 'is-public' : 'is-private'}`}>
                    {recipe.isPublic ? content.publicLabel : content.privateLabel}
                  </Badge>
                </span>
                <span className="my-recipe-meta">
                  {recipe.servings} {content.servingWord}{recipe.servings !== 1 ? 's' : ''}
                  {recipe.dietaryType && ` · ${recipe.dietaryType.replace('_', ' ')}`}
                  {recipe.cuisineType && ` · ${recipe.cuisineType}`}
                </span>
              </div>
              <div className="my-recipe-menu">
                <button
                  className="my-recipe-menu-btn"
                  aria-label={content.rowMenuLabel}
                  aria-expanded={openMenuId === recipe.id}
                  onClick={e => { e.stopPropagation(); setOpenMenuId(o => o === recipe.id ? null : recipe.id) }}
                >
                  <DotsThreeVerticalIcon weight="bold" />
                </button>

                {openMenuId === recipe.id && (
                  <>
                    <div className="my-recipe-menu-backdrop" onClick={e => { e.stopPropagation(); setOpenMenuId(null) }} />
                    <div className="my-recipe-dropdown" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditTarget(recipe); setOpenMenuId(null) }}>{content.editLabel}</button>
                      <button onClick={() => { handleDelete(recipe.id); setOpenMenuId(null) }}>{content.deleteLabel}</button>
                    </div>
                  </>
                )}
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
    <div className="hero-page-header">
      <div>
        <SkelBlock width="7rem" height="0.9rem" />
        <SkelBlock width="9rem" height="1.8rem" />
        <SkelBlock width="14rem" height="1rem" />
      </div>
      <SkelBlock width="8rem" height="2.25rem" radius="999px" />
    </div>
    <div className="my-recipes-list">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="my-recipe-row">
          <SkelBlock width="52px" height="52px" radius="8px" />
          <div className="my-recipe-info">
            <SkelBlock width="12rem" height="1rem" />
            <SkelBlock width="8rem" height="0.8rem" />
          </div>
          <SkelBlock width="32px" height="32px" radius="8px" />
        </div>
      ))}
    </div>
  </div>
)
