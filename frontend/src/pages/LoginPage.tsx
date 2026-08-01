import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { authApi } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { LandingHeader } from '../components/LandingHeader'
import { LandingFooter } from '../components/LandingFooter'

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      <LandingHeader />

      <section className="auth-hero">
        <div className="section-inner">
          <h1>Welcome back to your tastiest era</h1>
          <p>Log in to save recipes, track meals, and keep fridge panic in the past.</p>
        </div>
      </section>

      <div className="auth-page">
        <div className="auth-card">
          <h2>Log in to Recipe Finder</h2>
          <p className="auth-sub">Your next good meal is waiting.</p>
          {error && <p className="auth-error">{error}</p>}
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </label>
            <button type="submit" className="btn-pill btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>
          <p className="auth-link">
            New here? <Link to="/signup">Create a free account</Link>
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
