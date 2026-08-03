import { useState } from 'react'
import { DayPicker } from '@/components/DayPicker'
import { TimeWheelPicker, type TimeValue } from '@/components/TimeWheelPicker'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { todayKey, asTimeValue, combineDateAndTime } from '@/assets/dateTime'
import content from '@/content/scheduleModal.json'

interface Props {
  recipeName: string
  initial?: { scheduledAt: string; note: string | null }
  onConfirm: (scheduledAt: string, note: string) => void
  onClose: () => void
}

export const ScheduleModal = ({ recipeName, initial, onConfirm, onClose }: Props) => {
  const initialDate = initial ? new Date(initial.scheduledAt) : new Date()
  const [date, setDate] = useState(initial ? initialDate.toLocaleDateString('en-CA') : todayKey())
  const [time, setTime] = useState<TimeValue>(asTimeValue(initialDate))
  const [note, setNote] = useState(initial?.note ?? '')

  useBodyScrollLock()

  const handleSave = () => onConfirm(combineDateAndTime(date, time), note)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--sm">
        <div className="modal-header">
          <h3>{initial ? content.editTitle : content.title}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        <div className="mark-eaten-body">
          {!initial && <p className="schedule-recipe-name">{recipeName}</p>}

          <p className="section-label">{content.dateLabel}</p>
          <DayPicker value={date} onChange={setDate} mode="future" />

          <p className="section-label">{content.timeLabel}</p>
          <TimeWheelPicker value={time} onChange={setTime} />

          <p className="section-label">{content.noteLabel}</p>
          <textarea
            className="schedule-note-input"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={content.notePlaceholder}
            rows={2}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>{content.cancelLabel}</button>
          <button type="button" className="btn-primary" onClick={handleSave}>{content.confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
