import { useState } from 'react'
import { DayPicker } from '@/components/DayPicker'
import { TimeWheelPicker, type TimeValue } from '@/components/TimeWheelPicker'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { todayKey, asTimeValue, combineDateAndTime } from '@/assets/global-functions'
import content from '@/content/markEatenModal.json'

interface Props {
  initial?: string // ISO datetime of an existing entry — omit to default to now (creating a new entry)
  onConfirm: (eatenAt: string) => void
  onClose: () => void
}

export const MarkEatenModal = ({ initial, onConfirm, onClose }: Props) => {
  const initialDate = initial ? new Date(initial) : new Date()
  const [date, setDate] = useState(initial ? initialDate.toLocaleDateString('en-CA') : todayKey())
  const [time, setTime] = useState<TimeValue>(asTimeValue(initialDate))

  useBodyScrollLock()

  const handleSave = () => onConfirm(combineDateAndTime(date, time))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--sm">
        <div className="modal-header">
          <h3>{initial ? content.editTitle : content.title}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        <div className="mark-eaten-body">
          <p className="section-label">{content.dateLabel}</p>
          <DayPicker value={date} onChange={setDate} />

          <p className="section-label">{content.timeLabel}</p>
          <TimeWheelPicker value={time} onChange={setTime} />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>{content.cancelLabel}</button>
          <button type="button" className="btn-primary" onClick={handleSave}>{content.confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
