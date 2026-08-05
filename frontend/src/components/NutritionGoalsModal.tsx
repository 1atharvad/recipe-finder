import { useState, useEffect } from 'react'
import { Input } from 'advi-ui'
import { preferencesApi } from '@/api/api'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import content from '@/content/nutritionGoalsModal.json'

interface Props {
  onClose: () => void
  onSaved: () => void
}

// Goals live on the same UserPreferences row as dietary/cuisine — the PUT
// contract there is a full-object overwrite, so this always loads the
// current preferences first and re-sends dietary/cuisine unchanged, the same
// way PreferencesModal does, to avoid silently wiping them.
export const NutritionGoalsModal = ({ onClose, onSaved }: Props) => {
  const [dietaryType, setDietaryType] = useState<string | null>(null)
  const [cuisineType, setCuisineType] = useState<string | null>(null)
  const [calorieGoal, setCalorieGoal] = useState('')
  const [proteinGoal, setProteinGoal] = useState('')
  const [carbsGoal, setCarbsGoal] = useState('')
  const [fatGoal, setFatGoal] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useBodyScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)

    preferencesApi.get()
      .then(prefs => {
        setDietaryType(prefs.dietaryType)
        setCuisineType(prefs.cuisineType)
        setCalorieGoal(prefs.calorieGoal != null ? String(prefs.calorieGoal) : '')
        setProteinGoal(prefs.proteinGoal != null ? String(prefs.proteinGoal) : '')
        setCarbsGoal(prefs.carbsGoal != null ? String(prefs.carbsGoal) : '')
        setFatGoal(prefs.fatGoal != null ? String(prefs.fatGoal) : '')
      })
      .catch(() => setError(content.loadErrorMessage))
      .finally(() => setLoading(false))

    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toGoal = (raw: string): number | null => {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : null
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await preferencesApi.save({
        dietaryType,
        cuisineType,
        calorieGoal: toGoal(calorieGoal),
        proteinGoal: toGoal(proteinGoal),
        carbsGoal: toGoal(carbsGoal),
        fatGoal: toGoal(fatGoal),
      })
      onSaved()
      onClose()
    } catch {
      setError(content.saveErrorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--sm">
        <div className="modal-header">
          <h3>{content.title}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        {loading ? (
          <p style={{ padding: '1.5rem', textAlign: 'center' }}>{content.loadingLabel}</p>
        ) : (
          <>
            <p className="prefs-hint">{content.hint}</p>
            <div className="prefs-form nutrition-goals-form">
              <Input label={content.calorieLabel} type="number" min="0" className="app-input" value={calorieGoal} onChange={e => setCalorieGoal(e.target.value)} />
              <Input label={content.proteinLabel} type="number" min="0" className="app-input" value={proteinGoal} onChange={e => setProteinGoal(e.target.value)} />
              <Input label={content.carbsLabel} type="number" min="0" className="app-input" value={carbsGoal} onChange={e => setCarbsGoal(e.target.value)} />
              <Input label={content.fatLabel} type="number" min="0" className="app-input" value={fatGoal} onChange={e => setFatGoal(e.target.value)} />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div className="modal-footer">
              <button className="btn-secondary" onClick={onClose}>{content.cancelLabel}</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? content.savingLabel : content.saveLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
