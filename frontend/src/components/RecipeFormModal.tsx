import { useState, useEffect } from 'react'
import { SparkleIcon, PaperPlaneRightIcon } from '@phosphor-icons/react'
import { recipeApi, adminApi } from '@/api/api'
import { FormField } from '@/components/FormField'
import { SelectField } from '@/components/SelectField'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import content from '@/content/recipeFormModal.json'
import type { Recipe, RecipeRequest, ChatMessage } from '@/types'

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
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [sourceName, setSourceName] = useState(initial?.sourceName ?? '')
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '')
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false)
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number | ''>(initial?.prepTimeMinutes ?? '')
  const [cookTimeMinutes, setCookTimeMinutes] = useState<number | ''>(initial?.cookTimeMinutes ?? '')
  const [difficulty, setDifficulty] = useState<string>(initial?.difficulty ?? '')
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string }[]>(
    initial?.ingredients?.length ? initial.ingredients : [{ name: '', quantity: '' }]
  )
  const [steps, setSteps] = useState<string[]>(
    initial?.steps?.length ? initial.steps : ['']
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftMessages, setDraftMessages] = useState<ChatMessage[]>([])
  const [draftInput, setDraftInput] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [draftError, setDraftError] = useState('')

  useBodyScrollLock()

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

  const handleDraft = async () => {
    const text = draftInput.trim()
    if (!text || drafting) return
    const historyForRequest = draftMessages

    setDraftMessages(prev => [...prev, { role: 'user', content: text }])
    setDraftInput('')
    setDrafting(true)
    setDraftError('')

    try {
      const res = await recipeApi.draft(text, historyForRequest)
      setDraftMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
      const draft = res.recipe
      if (draft) {
        setName(draft.name)
        setServings(draft.servings)
        setDietaryType(draft.dietaryType ?? '')
        setCuisineType(draft.cuisineType ?? '')
        setPrepTimeMinutes(draft.prepTimeMinutes ?? '')
        setCookTimeMinutes(draft.cookTimeMinutes ?? '')
        setDifficulty(draft.difficulty ?? '')
        setIngredients(draft.ingredients.length ? draft.ingredients : [{ name: '', quantity: '' }])
        setSteps(draft.steps.length ? draft.steps : [''])
      }
    } catch (err: unknown) {
      const isPremiumRequired = err instanceof Error && err.message === 'Premium access required'
      setDraftError(isPremiumRequired ? content.draftPremiumRequiredMessage : content.draftErrorMessage)
    } finally {
      setDrafting(false)
    }
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
      imageUrl: imageUrl.trim() || null,
      sourceName: sourceName.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
      isPublic: context === 'user' ? isPublic : undefined,
      prepTimeMinutes: prepTimeMinutes === '' ? null : prepTimeMinutes,
      cookTimeMinutes: cookTimeMinutes === '' ? null : cookTimeMinutes,
      difficulty: difficulty || null,
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
      <div className="modal-card modal-card--lg">
        <div className="modal-header">
          <h3>{mode === 'create' ? content.titleCreate : content.titleEdit}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="recipe-form">
          {mode === 'create' && (
            <div className="ai-draft-box">
              <span className="ai-draft-label"><SparkleIcon weight="fill" /> {content.draftPromptLabel}</span>
              <p className="ai-draft-hint">{content.draftHint}</p>

              {draftMessages.length > 0 && (
                <div className="chat-thread ai-draft-thread">
                  {draftMessages.map((m, i) => (
                    <div key={i} className={`chat-message ${m.role}`}>
                      <div className="chat-bubble">{m.content}</div>
                    </div>
                  ))}
                  {drafting && (
                    <div className="chat-message assistant">
                      <div className="chat-bubble chat-typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {draftError && <p className="auth-error">{draftError}</p>}

              <div className="ai-draft-input-row">
                <textarea
                  value={draftInput}
                  onChange={e => setDraftInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDraft() } }}
                  placeholder={draftMessages.length ? content.draftFollowUpPlaceholder : content.draftPromptPlaceholder}
                  rows={1}
                  disabled={drafting}
                />
                <button
                  type="button"
                  className="btn-pill btn-primary btn-icon-only"
                  onClick={handleDraft}
                  disabled={drafting || !draftInput.trim()}
                  aria-label={content.draftButtonLabel}
                >
                  <PaperPlaneRightIcon weight="fill" />
                </button>
              </div>
            </div>
          )}

          <p className="section-label">{content.detailsSection}</p>

          <div className="form-row">
            <FormField
              label={content.nameLabel}
              value={name}
              onChange={setName}
              required
              placeholder={content.namePlaceholder}
            />
          </div>

          <div className="form-row form-row--3">
            <FormField label={content.servingsLabel} type="number" value={servings} onChange={v => setServings(Number(v))} min={1} />
            <SelectField label={content.dietaryLabel} value={dietaryType} onChange={setDietaryType} options={content.dietaryOptions} />
            <SelectField label={content.cuisineLabel} value={cuisineType} onChange={setCuisineType} options={content.cuisineOptions} />
          </div>

          <div className="form-row form-row--3">
            <FormField
              label={content.prepTimeLabel}
              type="number"
              value={prepTimeMinutes}
              onChange={v => setPrepTimeMinutes(v === '' ? '' : Number(v))}
              min={0}
            />
            <FormField
              label={content.cookTimeLabel}
              type="number"
              value={cookTimeMinutes}
              onChange={v => setCookTimeMinutes(v === '' ? '' : Number(v))}
              min={0}
            />
            <SelectField label={content.difficultyLabel} value={difficulty} onChange={setDifficulty} options={content.difficultyOptions} />
          </div>

          <p className="section-label">{content.mediaSection}</p>

          <div className="form-row form-row--2">
            <FormField
              label={content.imageUrlLabel}
              type="url"
              value={imageUrl}
              onChange={setImageUrl}
              placeholder={content.imageUrlPlaceholder}
            />
            <FormField
              label={content.videoUrlLabel}
              type="url"
              value={videoUrl}
              onChange={setVideoUrl}
              placeholder={content.videoUrlPlaceholder}
            />
          </div>

          <div className="form-row form-row--2">
            <FormField
              label={content.sourceNameLabel}
              value={sourceName}
              onChange={setSourceName}
              placeholder={content.sourceNamePlaceholder}
            />
            <FormField
              label={content.sourceUrlLabel}
              type="url"
              value={sourceUrl}
              onChange={setSourceUrl}
              placeholder={content.sourceUrlPlaceholder}
            />
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

          <p className="section-label">{content.ingredientsLegend}</p>

          <div className="form-fieldset">
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
          </div>

          <p className="section-label">{content.stepsLegend}</p>

          <div className="form-fieldset">
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
          </div>

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
