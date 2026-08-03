import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BowlSteamIcon, ListIcon, XIcon } from '@phosphor-icons/react'
import { useAuth } from '@/context/AuthContext'
import content from '@/content/landingHeader.json'

export const LandingHeader = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <span className="landing-logo"><BowlSteamIcon weight="duotone" /> {content.logo}</span>
        <nav className="landing-header-links">
          <a href="/features">{content.featuresLink}</a>
          <a href="/how-it-works">{content.howItWorksLink}</a>
        </nav>
        <div className="landing-header-actions">
          {isAuthenticated ? (
            <button
              className="landing-header-avatar"
              onClick={() => navigate('/dashboard')}
              aria-label={content.dashboardLabel}
              title={content.dashboardTitle}
            >
              {`${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase()}
            </button>
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
          <a href="/features" onClick={() => setMenuOpen(false)}>{content.featuresLink}</a>
          <a href="/how-it-works" onClick={() => setMenuOpen(false)}>{content.howItWorksLink}</a>
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
