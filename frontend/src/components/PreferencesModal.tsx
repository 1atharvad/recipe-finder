import { useState, useEffect } from 'react'
import { preferencesApi } from '@/api/api'
import { SelectField } from '@/components/SelectField'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import content from '@/content/preferencesModal.json'

interface Props {
  onClose: () => void
}

export const PreferencesModal = ({ onClose }: Props) => {
  const [dietary, setDietary] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useBodyScrollLock()

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
          <h3>{content.title}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        {loading ? (
          <p style={{ padding: '1.5rem', textAlign: 'center' }}>{content.loadingLabel}</p>
        ) : (
          <>
            <p className="prefs-hint">{content.hint}</p>
            <div className="prefs-form">
              <SelectField label={content.dietaryLabel} value={dietary} onChange={setDietary} options={content.dietaryOptions} />
              <SelectField label={content.cuisineLabel} value={cuisine} onChange={setCuisine} options={content.cuisineOptions} />
            </div>
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
