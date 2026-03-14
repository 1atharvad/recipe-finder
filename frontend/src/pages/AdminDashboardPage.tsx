import { useEffect, useState } from 'react'
import { adminApi } from '../api/api'
import type { Recipe } from '../types'
import { RecipeFormModal } from '../components/RecipeFormModal'

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
    if (!confirm('Delete this recipe from the general pool?')) return
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

  if (loading) return <div className="recipe-page-loading">Loading recipes...</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>{recipes.length} general recipes</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Add Recipe</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Servings</th>
              <th>Dietary</th>
              <th>Cuisine</th>
              <th>Ingredients</th>
              <th>Steps</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map(recipe => (
              <tr key={recipe.id}>
                <td>{recipe.name}</td>
                <td>{recipe.servings}</td>
                <td>{recipe.dietaryType?.replace('_', ' ') ?? '—'}</td>
                <td>{recipe.cuisineType ?? '—'}</td>
                <td>{recipe.ingredients?.length ?? 0}</td>
                <td>{recipe.steps?.length ?? 0}</td>
                <td className="admin-actions">
                  <button className="btn-edit" onClick={() => setEditTarget(recipe)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(recipe.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
