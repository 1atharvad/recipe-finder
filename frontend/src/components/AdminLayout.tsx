import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import { BowlSteamIcon, ListIcon, GlobeIcon, UsersIcon, ChartBarIcon, BrainIcon, SignOutIcon } from '@phosphor-icons/react'
import { PageAside, AsideDrawer } from 'advi-ui'
import { useAuth } from '@/context/AuthContext'
import content from '@/content/adminNav.json'

const ICONS: Record<string, Icon> = {
  BowlSteam: BowlSteamIcon, Globe: GlobeIcon, Users: UsersIcon, ChartBar: ChartBarIcon, Brain: BrainIcon,
}

export const AdminLayout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActive = (to: string, end: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  const logo = (
    <NavLink to="/admin" className="dashboard-logo">
      <BowlSteamIcon weight="duotone" /> {content.logo}
    </NavLink>
  )

  const navItems = content.navItems.map(item => {
    const ItemIcon = ICONS[item.icon]
    return {
      icon: <ItemIcon weight="bold" />,
      label: item.label,
      active: isActive(item.to, item.end),
      onClick: () => { navigate(item.to); setMenuOpen(false) },
    }
  })

  const asideFooter = () => (
    <div className="dashboard-sidebar-footer dashboard-sidebar-footer--admin">
      <button className="dashboard-nav-link dashboard-logout-link" onClick={handleLogout}>
        <SignOutIcon weight="bold" /> {content.logoutLabel}
      </button>
    </div>
  )

  return (
    <div className="landing dashboard-shell">
      <div className="dashboard-topbar">
        {logo}
        <AsideDrawer
          open={menuOpen}
          onOpenChange={setMenuOpen}
          closeBreakpoint="(min-width: 960px)"
          trigger={
            <button className="dashboard-menu-toggle" aria-label={content.openMenuLabel}>
              <ListIcon weight="bold" />
            </button>
          }
          openWidth="dashboard-aside-mobile-width"
          title={logo}
          items={navItems}
          footer={asideFooter}
        />
      </div>

      <PageAside
        className="dashboard-sidebar--desktop"
        openWidth="dashboard-aside-desktop-width"
        title={logo}
        items={navItems}
        footer={asideFooter}
      />

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
