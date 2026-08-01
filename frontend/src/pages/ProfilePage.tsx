import { useState, useEffect } from 'react'
import { UserCircle, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { userApi } from '../api/api'
import { useAuth } from '../context/AuthContext'

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
      setProfileError(err instanceof Error ? err.message : 'Could not update profile')
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus('error')
      setPasswordError('New passwords do not match')
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
      setPasswordError(err instanceof Error ? err.message : 'Could not update password')
    }
  }

  if (loading) {
    return <div className="recipe-page-loading">Loading profile...</div>
  }

  return (
    <section className="dashboard-home profile-page">
      <p className="section-label">Profile</p>
      <h1><UserCircle weight="fill" /> Your profile</h1>

      <div className="profile-card">
        <h2>Your info</h2>
        <form onSubmit={saveProfile} className="auth-form">
          <label>
            First name
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </label>
          <label>
            Last name
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>

          {profileStatus === 'done' && (
            <p className="msg success"><CheckCircle weight="bold" /> Profile updated</p>
          )}
          {profileStatus === 'error' && (
            <p className="msg error"><WarningCircle weight="bold" /> {profileError}</p>
          )}

          <button type="submit" className="btn-pill btn-primary" disabled={profileStatus === 'saving'}>
            {profileStatus === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="profile-card">
        <h2>Change password</h2>
        <form onSubmit={savePassword} className="auth-form">
          <label>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {passwordStatus === 'done' && (
            <p className="msg success"><CheckCircle weight="bold" /> Password updated</p>
          )}
          {passwordStatus === 'error' && (
            <p className="msg error"><WarningCircle weight="bold" /> {passwordError}</p>
          )}

          <button type="submit" className="btn-pill btn-primary" disabled={passwordStatus === 'saving'}>
            {passwordStatus === 'saving' ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </section>
  )
}
