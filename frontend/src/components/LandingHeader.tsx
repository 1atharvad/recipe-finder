import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import {
  BowlSteamIcon, ListIcon, XIcon, SquaresFourIcon, HeartIcon,
  NotePencilIcon, UserCircleIcon, SignOutIcon,
} from '@phosphor-icons/react'
import { useAuth } from '@/context/AuthContext'
import content from '@/content/landingHeader.json'

const ICONS: Record<string, Icon> = {
  SquaresFour: SquaresFourIcon, Heart: HeartIcon, NotePencil: NotePencilIcon, UserCircle: UserCircleIcon,
}

export const LandingHeader = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)

  const go = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  const goFromAvatar = (path: string) => {
    setAvatarMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setAvatarMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <span className="landing-logo"><BowlSteamIcon weight="duotone" /> {content.logo}</span>
        {!isAuthenticated && (
          <nav className="landing-header-links">
            {content.navLinks.map(link => (
              <a key={link.url} href={link.url}>{link.text}</a>
            ))}
          </nav>
        )}
        <div className="landing-header-actions">
          {isAuthenticated ? (
            <div className="landing-header-user-menu">
              <button
                className="landing-header-avatar"
                onClick={() => setAvatarMenuOpen(open => !open)}
                aria-label={content.dashboardLabel}
                title={content.dashboardTitle}
                aria-haspopup="true"
                aria-expanded={avatarMenuOpen}
              >
                {`${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase()}
              </button>

              {avatarMenuOpen && (
                <>
                  <div className="landing-header-user-menu-backdrop" onClick={() => setAvatarMenuOpen(false)} />
                  <div className="landing-header-user-dropdown">
                    {content.avatarMenuItems.map(item => {
                      const ItemIcon = ICONS[item.icon]
                      return (
                        <button key={item.to} onClick={() => goFromAvatar(item.to)}>
                          <ItemIcon weight="bold" /> {item.label}
                        </button>
                      )
                    })}
                    <button onClick={handleLogout}>
                      <SignOutIcon weight="bold" /> {content.logoutLabel}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button className="btn-link landing-header-login-inline" onClick={() => navigate('/login')}>
                {content.loginLabel}
              </button>
              <button
                className="btn-pill btn-primary btn-small landing-header-signup-inline"
                onClick={() => navigate('/signup')}
              >
                {content.signupLabel}
              </button>
            </>
          )}
          <button
            className="landing-header-toggle"
            onClick={() => setMenuOpen(open => !open)}
            aria-label={menuOpen ? content.closeMenuLabel : content.openMenuLabel}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XIcon weight="bold" /> : <ListIcon weight="bold" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="landing-header-menu">
          {!isAuthenticated && content.navLinks.map(link => (
            <a key={link.url} href={link.url} onClick={() => setMenuOpen(false)}>{link.text}</a>
          ))}
          {isAuthenticated ? (
            <button onClick={() => go('/dashboard')}>{content.dashboardTitle}</button>
          ) : (
            <>
              <button onClick={() => go('/login')}>{content.loginLabel}</button>
              <button onClick={() => go('/signup')}>{content.signupLabel}</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
