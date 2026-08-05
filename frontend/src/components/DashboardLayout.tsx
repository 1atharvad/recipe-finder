import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import {
  BowlSteamIcon, ListIcon, MagnifyingGlassIcon, SparkleIcon, PackageIcon, SquaresFourIcon, SignOutIcon, UserCircleIcon,
  HeartIcon, NotePencilIcon, ClockCounterClockwiseIcon, BellRingingIcon, ShoppingCartIcon, CookingPotIcon,
} from '@phosphor-icons/react'
import { PageAside, AsideDrawer } from 'advi-ui'
import { useAuth } from '@/context/AuthContext'
import { ChatWidget } from '@/components/ChatWidget'
import content from '@/content/dashboardNav.json'

const ICONS: Record<string, Icon> = {
  MagnifyingGlass: MagnifyingGlassIcon, Sparkle: SparkleIcon, Package: PackageIcon, SquaresFour: SquaresFourIcon,
  Heart: HeartIcon, NotePencil: NotePencilIcon, ClockCounterClockwise: ClockCounterClockwiseIcon,
  BellRinging: BellRingingIcon, ShoppingCart: ShoppingCartIcon, CookingPot: CookingPotIcon,
}

export const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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

  const isActive = (to: string, end: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  const logo = (
    <NavLink to="/" className="dashboard-logo">
      <BowlSteamIcon weight="duotone" /> {content.logo}
    </NavLink>
  )

  const navItems = content.navItems.map(item => {
    if ('divider' in item) {
      return { type: 'divider' as const, label: item.divider ?? '' }
    }
    const ItemIcon = ICONS[item.icon]
    // PageAside's AsideItem types `label` as a plain string, but it's
    // rendered as React children under the hood — safe to hand it a node
    // instead so "soon" items can carry a dimmed style + tag inline.
    const label = item.soon
      ? (
        <span className="dashboard-nav-soon">
          {item.label}
          <span className="dashboard-nav-soon-tag">{content.soonTag}</span>
        </span>
      ) as unknown as string
      : item.label
    return {
      icon: <ItemIcon weight="bold" className={item.soon ? 'dashboard-nav-soon-icon' : undefined} />,
      label,
      active: isActive(item.to, item.end),
      onClick: () => { navigate(item.to); setMenuOpen(false) },
    }
  })

  const asideFooter = () => (
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
                <UserCircleIcon weight="bold" /> {content.profileLabel}
              </button>
              <button onClick={handleLogout}>
                <SignOutIcon weight="bold" /> {content.logoutLabel}
              </button>
            </div>
          </>
        )}
      </div>
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

      <ChatWidget />
    </div>
  )
}
