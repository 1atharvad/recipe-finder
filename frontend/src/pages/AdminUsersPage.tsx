import { useEffect, useState } from 'react'
import { adminApi } from '@/api/api'
import type { AdminUser } from '@/types'
import content from '@/content/adminUsersPage.json'

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    adminApi.getUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleEnabled = async (user: AdminUser) => {
    if (user.enabled && !confirm(content.disableConfirm)) return
    try {
      await adminApi.setUserEnabled(user.id, !user.enabled)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u))
    } catch {}
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
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{content.columns.name}</th>
                  <th>{content.columns.email}</th>
                  <th>{content.columns.role}</th>
                  <th>{content.columns.joined}</th>
                  <th>{content.columns.status}</th>
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
                      <span className={`visibility-badge ${user.enabled ? 'is-public' : 'is-private'}`}>
                        {user.enabled ? content.enabledLabel : content.disabledLabel}
                      </span>
                    </td>
                    <td className="admin-actions">
                      <button
                        className={`btn-pill btn-small ${user.enabled ? 'btn-delete' : 'btn-edit'}`}
                        onClick={() => toggleEnabled(user)}
                      >
                        {user.enabled ? content.disableLabel : content.enableLabel}
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
