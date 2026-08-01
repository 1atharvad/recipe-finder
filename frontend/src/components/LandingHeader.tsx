import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BowlSteam, List, X } from '@phosphor-icons/react'

export const LandingHeader = () => {
  const navigate = useNavigate()
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
          <button className="btn-link landing-header-login-inline" onClick={() => navigate('/login')}>
            Log in
          </button>
          <button
            className="btn-pill btn-primary btn-small landing-header-signup-inline"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </button>
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
          <button onClick={() => go('/login')}>Log in</button>
          <button onClick={() => go('/signup')}>Sign up</button>
        </div>
      )}
    </header>
  )
}
