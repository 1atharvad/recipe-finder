import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { authApi } from '@/api/api'
import { useAuth } from '@/context/AuthContext'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { FormField } from '@/components/FormField'
import content from '@/content/signupPage.json'

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
      setError(content.passwordMismatchError)
      return
    }
    setLoading(true)
    try {
      const res = await authApi.signup({ firstName, lastName, email, password, confirmPassword })
      login(res)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : content.defaultError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      <LandingHeader />

      <section className="auth-hero">
        <div className="section-inner">
          <h1>{content.heroTitle}</h1>
          <p>{content.heroText}</p>
        </div>
      </section>

      <div className="auth-page">
        <div className="auth-card">
          <h2>{content.cardTitle}</h2>
          <p className="auth-sub">{content.cardSubtitle}</p>
          {error && <p className="auth-error">{error}</p>}
          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label={content.firstNameLabel} value={firstName} onChange={setFirstName} required autoFocus placeholder={content.firstNamePlaceholder} />
            <FormField label={content.lastNameLabel} value={lastName} onChange={setLastName} required placeholder={content.lastNamePlaceholder} />
            <FormField label={content.emailLabel} type="email" value={email} onChange={setEmail} required placeholder={content.emailPlaceholder} />
            <FormField label={content.passwordLabel} type="password" value={password} onChange={setPassword} required minLength={6} placeholder={content.passwordPlaceholder} />
            <FormField label={content.confirmPasswordLabel} type="password" value={confirmPassword} onChange={setConfirmPassword} required minLength={6} placeholder={content.confirmPasswordPlaceholder} />
            <button type="submit" className="btn-pill btn-primary" disabled={loading}>
              {loading ? content.submittingLabel : content.submitLabel}
            </button>
          </form>
          <p className="auth-link">
            {content.loginPrompt} <Link to="/login">{content.loginLink}</Link>
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
