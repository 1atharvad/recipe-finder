import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import {
  BowlSteam, List, X, MagnifyingGlass, Sparkle, Package, SquaresFour, SignOut, UserCircle,
  Heart, NotePencil, ClockCounterClockwise, BellRinging, ShoppingCart, CookingPot,
} from '@phosphor-icons/react'
import { useAuth } from '@/context/AuthContext'
import { ChatWidget } from '@/components/ChatWidget'
import content from '@/content/dashboardNav.json'

const ICONS: Record<string, Icon> = {
  MagnifyingGlass, Sparkle, Package, SquaresFour, Heart, NotePencil, ClockCounterClockwise,
  BellRinging, ShoppingCart, CookingPot,
}

export const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    setProfileMenuOpen(false)
    logout()
    navigate('/')
  }

  const goToProfile = () => {
    setProfileMenuOpen(false)
    setMenuOpen(false)
    navigate('/dashboard/profile')
  }

  return (
    <div className="landing dashboard-shell">
      <div className="dashboard-topbar">
        <NavLink to="/" className="dashboard-logo">
          <BowlSteam weight="duotone" /> {content.logo}
        </NavLink>
        <button
          className="dashboard-menu-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? content.closeMenuLabel : content.openMenuLabel}
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
          <BowlSteam weight="duotone" /> {content.logo}
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

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-menu">
            <button
              className="dashboard-user"
              onClick={() => setProfileMenuOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen}
            >
              <span className="dashboard-avatar">
                {`${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase()}
              </span>
              <span className="dashboard-username">{user?.firstName}</span>
            </button>

            {profileMenuOpen && (
              <>
                <div className="dashboard-user-menu-backdrop" onClick={() => setProfileMenuOpen(false)} />
                <div className="dashboard-user-dropdown">
                  <button onClick={goToProfile}>
                    <UserCircle weight="bold" /> {content.profileLabel}
                  </button>
                  <button onClick={handleLogout}>
                    <SignOut weight="bold" /> {content.logoutLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>

      <ChatWidget />
    </div>
  )
}
