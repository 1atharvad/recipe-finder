import { useEffect, useState } from 'react'
import { Globe } from '@phosphor-icons/react'
import { adminApi } from '@/api/api'
import type { PublicRecipe } from '@/types'
import content from '@/content/adminPublicRecipesPage.json'

export const AdminPublicRecipesPage = () => {
  const [recipes, setRecipes] = useState<PublicRecipe[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    adminApi.getPublicRecipes()
      .then(setRecipes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const unpublish = async (id: number) => {
    if (!confirm(content.unpublishConfirm)) return
    try {
      await adminApi.unpublishRecipe(id)
      setRecipes(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{content.title}</h2>
          {!loading && <p>{recipes.length} {content.countSuffix}</p>}
        </div>
      </div>

      {loading ? (
        <div className="recipe-page-loading">{content.loadingLabel}</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <Globe weight="fill" className="empty-icon-svg" />
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
        </div>
      ) : (
        <div className="admin-card admin-card--table">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{content.columns.name}</th>
                  <th>{content.columns.owner}</th>
                  <th>{content.columns.servings}</th>
                  <th>{content.columns.dietary}</th>
                  <th>{content.columns.cuisine}</th>
                  <th>{content.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(recipe => (
                  <tr key={recipe.id}>
                    <td>{recipe.name}</td>
                    <td>{recipe.ownerName}</td>
                    <td>{recipe.servings}</td>
                    <td>{recipe.dietaryType?.replace('_', ' ') ?? content.emptyValue}</td>
                    <td>{recipe.cuisineType ?? content.emptyValue}</td>
                    <td className="admin-actions">
                      <button className="btn-pill btn-small btn-delete" onClick={() => unpublish(recipe.id)}>
                        {content.unpublishLabel}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
