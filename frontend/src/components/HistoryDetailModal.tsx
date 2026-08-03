import { useNavigate } from 'react-router-dom'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { getRecipeImage } from '@/assets/recipeImages'
import { handleImageFallback } from '@/assets/imageFallback'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { formatTime } from '@/assets/dateTime'
import type { EatingHistoryEntry } from '@/types'
import content from '@/content/historyPage.json'

interface Props {
  entry: EatingHistoryEntry
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export const HistoryDetailModal = ({ entry, onEdit, onDelete, onClose }: Props) => {
  const navigate = useNavigate()
  useBodyScrollLock()

  const eatenOnLabel = new Date(entry.eatenOn + 'T00:00:00')
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
            src={getRecipeImage(entry.recipe.imageUrl)}
            alt={entry.recipe.name}
            onError={handleImageFallback}
          />
          <button className="entry-detail-name" onClick={() => navigate(`/recipe/${entry.recipe.id}`)}>
            {entry.recipe.name} <ArrowSquareOut weight="bold" />
          </button>
          <p className="entry-detail-meta">{eatenOnLabel} · {formatTime(entry.recordedAt)}</p>
        </div>

        <div className="modal-footer entry-detail-footer">
          <button type="button" className="btn-pill btn-small btn-delete" onClick={onDelete}>{content.deleteLabel}</button>
          <button type="button" className="btn-secondary" onClick={onEdit}>{content.editLabel}</button>
        </div>
      </div>
    </div>
  )
}
