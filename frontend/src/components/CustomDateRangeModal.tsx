import { useState } from 'react'
import { DayPicker } from '@/components/DayPicker'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { todayKey } from '@/assets/global-functions'
import type { CustomRange } from '@/assets/nutrition'
import content from '@/content/customDateRangeModal.json'

interface Props {
  initial: CustomRange | null
  onApply: (range: CustomRange) => void
  onClose: () => void
}

export const CustomDateRangeModal = ({ initial, onApply, onClose }: Props) => {
  const today = todayKey()
  const [from, setFrom] = useState(initial?.from ?? today)
  const [to, setTo] = useState(initial?.to ?? today)

  useBodyScrollLock()

  // Eating history is always in the past, so both ends share DayPicker's
  // 'past' mode — clamping the other end here keeps [from, to] valid
  // without a separate error state to show/dismiss.
  const handleFromChange = (dateKey: string) => {
    setFrom(dateKey)
    if (dateKey > to) setTo(dateKey)
  }

  const handleToChange = (dateKey: string) => {
    setTo(dateKey)
    if (dateKey < from) setFrom(dateKey)
  }

  // onApply itself closes the modal (it flips customModalOpen off) — calling
  // the plain onClose here too would run its "no range chosen, fall back"
  // check against a customRange still stale from before this update landed.
  const handleApply = () => onApply({ from, to })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--sm">
        <div className="modal-header">
          <h3>{content.title}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        <div className="mark-eaten-body">
          <p className="section-label">{content.fromLabel}</p>
          <DayPicker value={from} onChange={handleFromChange} mode="past" />

          <p className="section-label">{content.toLabel}</p>
          <DayPicker value={to} onChange={handleToChange} mode="past" />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>{content.cancelLabel}</button>
          <button type="button" className="btn-primary" onClick={handleApply}>{content.applyLabel}</button>
        </div>
      </div>
    </div>
  )
}
