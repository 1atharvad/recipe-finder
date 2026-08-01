import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BowlSteam, List, X } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'

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
        <span className="landing-logo"><BowlSteam weight="duotone" /> Recipe Finder</span>
        <nav className="landing-header-links">
          <a href="/features">Features</a>
          <a href="/how-it-works">How it works</a>
        </nav>
        <div className="landing-header-actions">
          {isAuthenticated ? (
            <button
              className="landing-header-avatar"
              onClick={() => navigate('/dashboard')}
              aria-label="Go to dashboard"
              title="Dashboard"
            >
              {`${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase()}
            </button>
          ) : (
            <>
              <button className="btn-link landing-header-login-inline" onClick={() => navigate('/login')}>
                Log in
              </button>
              <button
                className="btn-pill btn-primary btn-small landing-header-signup-inline"
                onClick={() => navigate('/signup')}
              >
                Sign up
              </button>
            </>
          )}
          <button
            className="landing-header-toggle"
            onClick={() => setMenuOpen(open => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X weight="bold" /> : <List weight="bold" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="landing-header-menu">
          <a href="/features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="/how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          {isAuthenticated ? (
            <button onClick={() => go('/dashboard')}>Dashboard</button>
          ) : (
            <>
              <button onClick={() => go('/login')}>Log in</button>
              <button onClick={() => go('/signup')}>Sign up</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
