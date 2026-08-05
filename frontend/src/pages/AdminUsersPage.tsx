import { useEffect, useState } from 'react'
import { toast, Badge } from 'advi-ui'
import { adminApi } from '@/api/api'
import type { AdminUser } from '@/types'
import content from '@/content/adminUsersPage.json'

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    adminApi.getUsers()
      .then(setUsers)
      .catch(() => toast.error(content.loadErrorMessage))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleEnabled = async (user: AdminUser) => {
    if (user.enabled && !confirm(content.disableConfirm)) return
    try {
      await adminApi.setUserEnabled(user.id, !user.enabled)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u))
    } catch {
      toast.error(content.actionErrorMessage)
    }
  }

  const togglePremium = async (user: AdminUser) => {
    try {
      await adminApi.setUserPremiumAccess(user.id, !user.premiumAccess)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, premiumAccess: !u.premiumAccess } : u))
    } catch {
      toast.error(content.actionErrorMessage)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{content.title}</h2>
          {!loading && <p>{users.length} {content.countSuffix}</p>}
        </div>
      </div>

      {loading ? (
        <div className="recipe-page-loading">{content.loadingLabel}</div>
      ) : (
        <div className="admin-card admin-card--table">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{content.columns.name}</th>
                  <th>{content.columns.email}</th>
                  <th>{content.columns.role}</th>
                  <th>{content.columns.joined}</th>
                  <th>{content.columns.status}</th>
                  <th>{content.columns.premium}</th>
                  <th>{content.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.role.replace('ROLE_', '')}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Badge className={`visibility-badge ${user.enabled ? 'is-public' : 'is-private'}`}>
                        {user.enabled ? content.enabledLabel : content.disabledLabel}
                      </Badge>
                    </td>
                    <td>
                      <Badge className={`visibility-badge ${user.premiumAccess ? 'is-public' : 'is-private'}`}>
                        {user.premiumAccess ? content.premiumOnLabel : content.premiumOffLabel}
                      </Badge>
                    </td>
                    <td className="admin-actions">
                      <button
                        className={`btn-pill btn-small ${user.enabled ? 'btn-delete' : 'btn-edit'}`}
                        onClick={() => toggleEnabled(user)}
                      >
                        {user.enabled ? content.disableLabel : content.enableLabel}
                      </button>
                      <button
                        className={`btn-pill btn-small ${user.premiumAccess ? 'btn-delete' : 'btn-edit'}`}
                        onClick={() => togglePremium(user)}
                      >
                        {user.premiumAccess ? content.revokePremiumLabel : content.grantPremiumLabel}
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
