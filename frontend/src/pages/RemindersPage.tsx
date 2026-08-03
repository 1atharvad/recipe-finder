import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRinging, ForkKnife } from '@phosphor-icons/react'
import { scheduleApi } from '@/api/api'
import { ScheduleModal } from '@/components/ScheduleModal'
import { ReminderDetailModal } from '@/components/ReminderDetailModal'
import { TimelinePageSkeleton } from '@/components/Skeleton'
import { formatTime } from '@/assets/dateTime'
import type { MealSchedule } from '@/types'
import content from '@/content/remindersPage.json'

export const RemindersPage = () => {
  const [schedules, setSchedules] = useState<MealSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [detailTarget, setDetailTarget] = useState<MealSchedule | null>(null)
  const [editTarget, setEditTarget] = useState<MealSchedule | null>(null)

  useEffect(() => {
    scheduleApi.getAll()
      .then(setSchedules)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { upcoming, completed } = useMemo(() => ({
    upcoming: schedules.filter(s => !s.completed),
    completed: schedules.filter(s => s.completed).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
  }), [schedules])

  const grouped = useMemo(() => {
    return upcoming.reduce<Record<string, MealSchedule[]>>((acc, s) => {
      const date = s.scheduledAt.slice(0, 10)
      if (!acc[date]) acc[date] = []
      acc[date].push(s)
      return acc
    }, {})
  }, [upcoming])

  const sortedDates = Object.keys(grouped).sort()

  const handleComplete = async (id: number) => {
    const prev = schedules
    setSchedules(s => s.map(x => x.id === id ? { ...x, completed: true } : x))
    setDetailTarget(null)
    try {
      await scheduleApi.complete(id)
    } catch {
      setSchedules(prev)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(content.deleteConfirm)) return
    const prev = schedules
    setSchedules(s => s.filter(x => x.id !== id))
    setDetailTarget(null)
    try {
      await scheduleApi.delete(id)
    } catch {
      setSchedules(prev)
    }
  }

  const handleEditSave = async (scheduledAt: string, note: string) => {
    if (!editTarget) return
    try {
      const updated = await scheduleApi.update(editTarget.id, scheduledAt, note)
      setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s))
    } catch {}
    setEditTarget(null)
  }

  if (loading) return <TimelinePageSkeleton />

  if (schedules.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <BellRinging weight="fill" className="empty-icon-svg" />
          <h2>{content.emptyTitle}</h2>
          <p>{content.emptyText}</p>
          <Link to="/dashboard/search" className="btn-pill btn-primary">{content.browseLabel}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>{content.title}</h2>
        <p>{schedules.length} {content.countWord}{schedules.length !== 1 ? 's' : ''}</p>
      </div>

      {upcoming.length > 0 && (
        <>
          <p className="section-label">{content.upcomingSectionLabel}</p>
          <div className="history-timeline">
            {sortedDates.map(date => (
              <div key={date} className="history-day-group">
                <div className="history-day-marker">
                  <span className="history-day-dot" />
                  <span className="history-day-label">{formatDayLabel(date)}</span>
                </div>
                <div className="history-day-entries">
                  {grouped[date].map(s => (
                    <ReminderRow key={s.id} schedule={s} onOpen={setDetailTarget} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {completed.length > 0 && (
        <>
          <p className="section-label">{content.completedSectionLabel}</p>
          <div className="history-day-entries">
            {completed.map(s => (
              <ReminderRow key={s.id} schedule={s} onOpen={setDetailTarget} />
            ))}
          </div>
        </>
      )}

      {detailTarget && (
        <ReminderDetailModal
          schedule={detailTarget}
          onComplete={() => handleComplete(detailTarget.id)}
          onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null) }}
          onDelete={() => handleDelete(detailTarget.id)}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {editTarget && (
        <ScheduleModal
          recipeName={editTarget.recipe.name}
          initial={{ scheduledAt: editTarget.scheduledAt, note: editTarget.note }}
          onConfirm={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}

interface ReminderRowProps {
  schedule: MealSchedule
  onOpen: (schedule: MealSchedule) => void
}

const ReminderRow = ({ schedule, onOpen }: ReminderRowProps) => {
  const overdue = !schedule.completed && new Date(schedule.scheduledAt) < new Date()

  return (
    <button type="button" className={`history-entry reminder-entry${overdue ? ' overdue' : ''}`} onClick={() => onOpen(schedule)}>
      <span className="reminder-entry-top">
        <span className="history-entry-link">
          <ForkKnife weight="bold" className="history-entry-icon" />
          <span className="history-entry-name">{schedule.recipe.name}</span>
          <span className="history-entry-time">{formatTime(schedule.scheduledAt)}</span>
        </span>
      </span>

      {(overdue || schedule.note) && (
        <span className="reminder-entry-meta">
          {overdue && <span className="meta-badge tone-peach">{content.overdueLabel}</span>}
          {schedule.note && <span className="reminder-note">{schedule.note}</span>}
        </span>
      )}
    </button>
  )
}

const formatDayLabel = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (dateStr === today.toISOString().split('T')[0]) return content.todayLabel
  if (dateStr === tomorrow.toISOString().split('T')[0]) return content.tomorrowLabel

  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
