import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import { BowlSteamIcon, ListIcon, XIcon, GlobeIcon, UsersIcon, ChartBarIcon, BrainIcon, SignOutIcon } from '@phosphor-icons/react'
import { useAuth } from '@/context/AuthContext'
import content from '@/content/adminNav.json'

const ICONS: Record<string, Icon> = { BowlSteamIcon, GlobeIcon, UsersIcon, ChartBarIcon, BrainIcon }

export const AdminLayout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="landing dashboard-shell">
      <div className="dashboard-topbar">
        <NavLink to="/admin" className="dashboard-logo">
          <BowlSteamIcon weight="duotone" /> {content.logo}
        </NavLink>
        <button
          className="dashboard-menu-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? content.closeMenuLabel : content.openMenuLabel}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <XIcon weight="bold" /> : <ListIcon weight="bold" />}
        </button>
      </div>

      {menuOpen && (
        <div className="dashboard-sidebar-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={menuOpen ? 'dashboard-sidebar open' : 'dashboard-sidebar'}>
        <NavLink to="/admin" className="dashboard-logo">
          <BowlSteamIcon weight="duotone" /> {content.logo}
        </NavLink>

        <nav className="dashboard-nav">
          {content.navItems.map(item => {
            const ItemIcon = ICONS[item.icon]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => isActive ? 'dashboard-nav-link active' : 'dashboard-nav-link'}
              >
                <ItemIcon weight="bold" /> {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="dashboard-sidebar-footer dashboard-sidebar-footer--admin">
          <button className="dashboard-nav-link dashboard-logout-link" onClick={handleLogout}>
            <SignOutIcon weight="bold" /> {content.logoutLabel}
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
