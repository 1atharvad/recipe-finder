import { useState, useEffect } from 'react'
import { UserCircle, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { userApi } from '@/api/api'
import { useAuth } from '@/context/AuthContext'
import { FormField } from '@/components/FormField'
import content from '@/content/profilePage.json'

export const ProfilePage = () => {
  const { updateName } = useAuth()

  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    userApi.getProfile()
      .then(p => {
        setFirstName(p.firstName)
        setLastName(p.lastName)
        setEmail(p.email)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileStatus('saving')
    setProfileError('')
    try {
      const updated = await userApi.updateProfile({ firstName, lastName, email })
      updateName(updated.firstName, updated.lastName)
      setProfileStatus('done')
    } catch (err: unknown) {
      setProfileStatus('error')
      setProfileError(err instanceof Error ? err.message : content.defaultProfileError)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus('error')
      setPasswordError(content.passwordMismatchError)
      return
    }
    setPasswordStatus('saving')
    setPasswordError('')
    try {
      await userApi.changePassword({ currentPassword, newPassword, confirmNewPassword })
      setPasswordStatus('done')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: unknown) {
      setPasswordStatus('error')
      setPasswordError(err instanceof Error ? err.message : content.defaultPasswordError)
    }
  }

  if (loading) {
    return <div className="recipe-page-loading">{content.loadingLabel}</div>
  }

  return (
    <section className="dashboard-home profile-page">
      <p className="section-label">{content.sectionLabel}</p>
      <h1><UserCircle weight="fill" /> {content.title}</h1>

      <div className="profile-card">
        <h2>{content.infoCard.title}</h2>
        <form onSubmit={saveProfile} className="auth-form">
          <FormField label={content.infoCard.firstNameLabel} value={firstName} onChange={setFirstName} required />
          <FormField label={content.infoCard.lastNameLabel} value={lastName} onChange={setLastName} required />
          <FormField label={content.infoCard.emailLabel} type="email" value={email} onChange={setEmail} required />

          {profileStatus === 'done' && (
            <p className="msg success"><CheckCircle weight="bold" /> {content.infoCard.successMessage}</p>
          )}
          {profileStatus === 'error' && (
            <p className="msg error"><WarningCircle weight="bold" /> {profileError}</p>
          )}

          <button type="submit" className="btn-pill btn-primary" disabled={profileStatus === 'saving'}>
            {profileStatus === 'saving' ? content.infoCard.savingLabel : content.infoCard.saveLabel}
          </button>
        </form>
      </div>

      <div className="profile-card">
        <h2>{content.passwordCard.title}</h2>
        <form onSubmit={savePassword} className="auth-form">
          <FormField label={content.passwordCard.currentPasswordLabel} type="password" value={currentPassword} onChange={setCurrentPassword} required />
          <FormField label={content.passwordCard.newPasswordLabel} type="password" value={newPassword} onChange={setNewPassword} required minLength={6} />
          <FormField label={content.passwordCard.confirmNewPasswordLabel} type="password" value={confirmNewPassword} onChange={setConfirmNewPassword} required minLength={6} />

          {passwordStatus === 'done' && (
            <p className="msg success"><CheckCircle weight="bold" /> {content.passwordCard.successMessage}</p>
          )}
          {passwordStatus === 'error' && (
            <p className="msg error"><WarningCircle weight="bold" /> {passwordError}</p>
          )}

          <button type="submit" className="btn-pill btn-primary" disabled={passwordStatus === 'saving'}>
            {passwordStatus === 'saving' ? content.passwordCard.savingLabel : content.passwordCard.saveLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
