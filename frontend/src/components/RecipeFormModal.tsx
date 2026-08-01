import { useState, useEffect } from 'react'
import { recipeApi, adminApi } from '@/api/api'
import { FormField } from '@/components/FormField'
import { SelectField } from '@/components/SelectField'
import content from '@/content/recipeFormModal.json'
import type { Recipe, RecipeRequest } from '@/types'

interface Props {
  mode: 'create' | 'edit'
  context: 'user' | 'admin'
  initial?: Recipe
  onSave: (recipe: Recipe) => void
  onClose: () => void
}

export const RecipeFormModal = ({ mode, context, initial, onSave, onClose }: Props) => {
  const [name, setName] = useState(initial?.name ?? '')
  const [servings, setServings] = useState(initial?.servings ?? 2)
  const [dietaryType, setDietaryType] = useState<string>(initial?.dietaryType ?? '')
  const [cuisineType, setCuisineType] = useState<string>(initial?.cuisineType ?? '')
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? '')
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false)
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string }[]>(
    initial?.ingredients?.length ? initial.ingredients : [{ name: '', quantity: '' }]
  )
  const [steps, setSteps] = useState<string[]>(
    initial?.steps?.length ? initial.steps : ['']
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const addIngredient = () => setIngredients(prev => [...prev, { name: '', quantity: '' }])
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i))
  const updateIngredient = (i: number, field: 'name' | 'quantity', val: string) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing))
  }

  const addStep = () => setSteps(prev => [...prev, ''])
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i))
  const updateStep = (i: number, val: string) => {
    setSteps(prev => prev.map((s, idx) => idx === i ? val : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body: RecipeRequest = {
      name,
      servings,
      ingredients: ingredients.filter(i => i.name.trim()),
      steps: steps.filter(s => s.trim()),
      dietaryType: dietaryType || null,
      cuisineType: cuisineType || null,
      videoUrl: videoUrl.trim() || null,
      isPublic: context === 'user' ? isPublic : undefined,
    }

    try {
      let saved: Recipe
      if (context === 'admin') {
        saved = mode === 'create'
          ? await adminApi.create(body)
          : await adminApi.update(initial!.id, body)
      } else {
        saved = mode === 'create'
          ? await recipeApi.createMine(body)
          : await recipeApi.updateMine(initial!.id, body)
      }
      onSave(saved)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : content.defaultError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3>{mode === 'create' ? content.titleCreate : content.titleEdit}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-row">
            <label className="form-label-full">
              {content.nameLabel}
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder={content.namePlaceholder}
              />
            </label>
          </div>

          <div className="form-row form-row--3">
            <FormField label={content.servingsLabel} type="number" value={servings} onChange={v => setServings(Number(v))} min={1} />
            <SelectField label={content.dietaryLabel} value={dietaryType} onChange={setDietaryType} options={content.dietaryOptions} />
            <SelectField label={content.cuisineLabel} value={cuisineType} onChange={setCuisineType} options={content.cuisineOptions} />
          </div>

          <div className="form-row">
            <label className="form-label-full">
              {content.videoUrlLabel}
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder={content.videoUrlPlaceholder}
              />
            </label>
          </div>

          {context === 'user' && (
            <label className="form-checkbox-row">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
              />
              {content.publicCheckboxLabel}
            </label>
          )}

          <fieldset className="form-fieldset">
            <legend>{content.ingredientsLegend}</legend>
            {ingredients.map((ing, i) => (
              <div key={i} className="ingredient-row">
                <input
                  type="text"
                  value={ing.quantity}
                  onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                  placeholder={content.ingredientQuantityPlaceholder}
                  className="ing-qty-input"
                />
                <input
                  type="text"
                  value={ing.name}
                  onChange={e => updateIngredient(i, 'name', e.target.value)}
                  placeholder={content.ingredientNamePlaceholder}
                  className="ing-name-input"
                />
                {ingredients.length > 1 && (
                  <button type="button" className="remove-row-btn" onClick={() => removeIngredient(i)}>{content.closeLabel}</button>
                )}
              </div>
            ))}
            <button type="button" className="add-row-btn" onClick={addIngredient}>{content.addIngredientLabel}</button>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>{content.stepsLegend}</legend>
            {steps.map((step, i) => (
              <div key={i} className="step-row">
                <span className="step-num">{i + 1}</span>
                <textarea
                  value={step}
                  onChange={e => updateStep(i, e.target.value)}
                  placeholder={`${content.stepPlaceholderPrefix} ${i + 1}`}
                  rows={2}
                />
                {steps.length > 1 && (
                  <button type="button" className="remove-row-btn" onClick={() => removeStep(i)}>{content.closeLabel}</button>
                )}
              </div>
            ))}
            <button type="button" className="add-row-btn" onClick={addStep}>{content.addStepLabel}</button>
          </fieldset>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>{content.cancelLabel}</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? content.savingLabel : mode === 'create' ? content.createLabel : content.saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
