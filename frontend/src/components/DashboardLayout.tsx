import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BowlSteam, List, X, MagnifyingGlass, Sparkle, Package, SquaresFour, SignOut } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { ChatWidget } from './ChatWidget'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: SquaresFour, end: true },
  { to: '/dashboard/search', label: 'Search', icon: MagnifyingGlass, end: false },
  { to: '/dashboard/recommender', label: 'Recommender', icon: Sparkle, end: false },
  { to: '/dashboard/inventory', label: 'Inventory', icon: Package, end: false },
]

export const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="landing dashboard-shell">
      <div className="dashboard-topbar">
        <NavLink to="/" className="dashboard-logo">
          <BowlSteam weight="duotone" /> Recipe Finder
        </NavLink>
        <button
          className="dashboard-menu-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X weight="bold" /> : <List weight="bold" />}
        </button>
      </div>

      {menuOpen && (
        <div className="dashboard-sidebar-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={menuOpen ? 'dashboard-sidebar open' : 'dashboard-sidebar'}>
        <NavLink to="/" className="dashboard-logo">
          <BowlSteam weight="duotone" /> Recipe Finder
        </NavLink>

        <nav className="dashboard-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => isActive ? 'dashboard-nav-link active' : 'dashboard-nav-link'}
            >
              <item.icon weight="bold" /> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <span className="dashboard-username">{user?.username}</span>
          <button className="btn-link" onClick={handleLogout}>
            <SignOut weight="bold" /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>

      <ChatWidget />
    </div>
  )
}
