import { useNavigate } from 'react-router-dom'
import { Badge } from 'advi-ui'
import { ArrowSquareOutIcon, CheckCircleIcon } from '@phosphor-icons/react'
import { getRecipeImage, handleImageFallback, formatTime } from '@/assets/global-functions'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import type { MealSchedule } from '@/types'
import content from '@/content/remindersPage.json'

interface Props {
  schedule: MealSchedule
  onComplete: () => void
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export const ReminderDetailModal = ({ schedule, onComplete, onEdit, onDelete, onClose }: Props) => {
  const navigate = useNavigate()
  useBodyScrollLock()

  const overdue = !schedule.completed && new Date(schedule.scheduledAt) < new Date()
  const scheduledDateLabel = new Date(schedule.scheduledAt)
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-card--sm">
        <div className="modal-header">
          <h3>{content.detailTitle}</h3>
          <button className="modal-close" onClick={onClose}>{content.closeLabel}</button>
        </div>

        <div className="entry-detail-body">
          <img
            className="entry-detail-img"
            src={getRecipeImage(schedule.recipe.imageUrl)}
            alt={schedule.recipe.name}
            onError={handleImageFallback}
          />
          <button className="entry-detail-name" onClick={() => navigate(`/recipe/${schedule.recipe.id}`)}>
            {schedule.recipe.name} <ArrowSquareOutIcon weight="bold" />
          </button>
          <p className="entry-detail-meta">
            {scheduledDateLabel} · {formatTime(schedule.scheduledAt)}
            {schedule.completed && <Badge className="meta-badge tone-sage">{content.completedBadgeLabel}</Badge>}
            {overdue && <Badge className="meta-badge tone-peach">{content.overdueLabel}</Badge>}
          </p>
          <p className="entry-detail-note">{schedule.note || content.noNoteLabel}</p>
        </div>

        <div className="modal-footer entry-detail-footer">
          <button type="button" className="btn-pill btn-small btn-delete" onClick={onDelete}>{content.deleteLabel}</button>
          {!schedule.completed && (
            <>
              <button type="button" className="btn-secondary" onClick={onEdit}>{content.editLabel}</button>
              <button type="button" className="btn-primary" onClick={onComplete}>
                <CheckCircleIcon weight="bold" /> {content.markDoneLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
