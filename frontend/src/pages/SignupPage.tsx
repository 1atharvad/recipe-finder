import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { authApi } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { LandingHeader } from '../components/LandingHeader'
import { LandingFooter } from '../components/LandingFooter'

export const SignupPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.signup({ firstName, lastName, email, password, confirmPassword })
      login(res)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      <LandingHeader />

      <section className="auth-hero">
        <div className="section-inner">
          <h1>Start your tastiest era today</h1>
          <p>Create a free account to save recipes, track what you cook, and get picks that fit you.</p>
        </div>
      </section>

      <div className="auth-page">
        <div className="auth-card">
          <h2>Create your Recipe Finder account</h2>
          <p className="auth-sub">Good food starts here.</p>
          {error && <p className="auth-error">{error}</p>}
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              First name
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                autoFocus
                placeholder="Jamie"
              />
            </label>
            <label>
              Last name
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                placeholder="Oliver"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
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
                minLength={6}
                placeholder="at least 6 characters"
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="re-enter your password"
              />
            </label>
            <button type="submit" className="btn-pill btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
