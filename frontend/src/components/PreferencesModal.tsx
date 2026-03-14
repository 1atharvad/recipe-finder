import { useState, useEffect } from 'react'
import { preferencesApi } from '../api/api'

interface Props {
  onClose: () => void
}

const DIETARY_OPTIONS = ['', 'VEGETARIAN', 'VEGAN', 'NON_VEGETARIAN']
const CUISINE_OPTIONS = ['', 'ITALIAN', 'INDIAN', 'ASIAN', 'MEXICAN', 'OTHER']

export const PreferencesModal = ({ onClose }: Props) => {
  const [dietary, setDietary] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)

    preferencesApi.get()
      .then(prefs => {
        setDietary(prefs.dietaryType ?? '')
        setCuisine(prefs.cuisineType ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = async () => {
    setSaving(true)
    try {
      await preferencesApi.save({
        dietaryType: dietary || null,
        cuisineType: cuisine || null,
      })
      onClose()
    } catch {} finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--sm">
        <div className="modal-header">
          <h3>Your Preferences</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p style={{ padding: '1.5rem', textAlign: 'center' }}>Loading...</p>
        ) : (
          <>
            <p className="prefs-hint">
              These preferences boost your recommendation scores for matching recipes.
            </p>
            <div className="prefs-form">
              <label>
                Dietary preference
                <select value={dietary} onChange={e => setDietary(e.target.value)}>
                  {DIETARY_OPTIONS.map(o => (
                    <option key={o} value={o}>{o ? o.replace('_', ' ') : '— No preference —'}</option>
                  ))}
                </select>
              </label>
              <label>
                Cuisine preference
                <select value={cuisine} onChange={e => setCuisine(e.target.value)}>
                  {CUISINE_OPTIONS.map(o => (
                    <option key={o} value={o}>{o || '— No preference —'}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Preferences'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
