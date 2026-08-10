import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'advi-ui'
import { authApi } from '@/api/api'
import { useAuth } from '@/context/AuthContext'
import { FormField } from '@/components/FormField'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import content from '@/content/adminLoginPage.json'

export const AdminLoginPage = () => {
  const { isAdmin, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAdmin) return <Navigate to="/admin" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.adminLogin({ username, password })
      login(res)
      navigate('/admin')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('401') || message.includes('Invalid')) {
        toast.error(content.errorInvalidCredentials)
      } else if (message.includes('network') || message.includes('fetch')) {
        toast.error(content.errorNetwork)
      } else {
        toast.error(content.errorDefault)
      }
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
        <div className="auth-card auth-card--admin">
          <h2>{content.title}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label={content.usernameLabel} value={username} onChange={setUsername} required autoFocus />
            <FormField label={content.passwordLabel} type="password" value={password} onChange={setPassword} required />
            <button type="submit" className="btn-pill btn-primary" disabled={loading}>
              {loading ? content.submittingLabel : content.submitLabel}
            </button>
          </form>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
