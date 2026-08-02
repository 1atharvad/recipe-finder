import { useEffect, useState } from 'react'
import { adminApi } from '@/api/api'
import type { Recipe } from '@/types'
import { RecipeFormModal } from '@/components/RecipeFormModal'
import content from '@/content/adminDashboardPage.json'

export const AdminDashboardPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Recipe | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = () => {
    adminApi.getAll()
      .then(setRecipes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: number) => {
    if (!confirm(content.deleteConfirm)) return
    try {
      await adminApi.delete(id)
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{content.title}</h2>
          {!loading && <p>{recipes.length} {content.countSuffix}</p>}
        </div>
        <button className="btn-pill btn-primary" onClick={() => setShowCreate(true)}>{content.addRecipeLabel}</button>
      </div>

      {loading ? (
        <div className="recipe-page-loading">{content.loadingLabel}</div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{content.columns.name}</th>
                  <th>{content.columns.servings}</th>
                  <th>{content.columns.dietary}</th>
                  <th>{content.columns.cuisine}</th>
                  <th>{content.columns.ingredients}</th>
                  <th>{content.columns.steps}</th>
                  <th>{content.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(recipe => (
                  <tr key={recipe.id}>
                    <td>{recipe.name}</td>
                    <td>{recipe.servings}</td>
                    <td>{recipe.dietaryType?.replace('_', ' ') ?? content.emptyValue}</td>
                    <td>{recipe.cuisineType ?? content.emptyValue}</td>
                    <td>{recipe.ingredients?.length ?? 0}</td>
                    <td>{recipe.steps?.length ?? 0}</td>
                    <td className="admin-actions">
                      <button className="btn-pill btn-small btn-edit" onClick={() => setEditTarget(recipe)}>{content.editLabel}</button>
                      <button className="btn-pill btn-small btn-delete" onClick={() => handleDelete(recipe.id)}>{content.deleteLabel}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <RecipeFormModal
          mode="create"
          context="admin"
          onSave={handleSaved}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <RecipeFormModal
          mode="edit"
          context="admin"
          initial={editTarget}
          onSave={handleSaved}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
