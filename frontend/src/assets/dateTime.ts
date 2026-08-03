import type { TimeValue } from '@/components/TimeWheelPicker'

// Shared by MarkEatenModal and ScheduleModal, which both combine a
// DayPicker date + TimeWheelPicker time into a single ISO datetime string.

export const todayKey = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time

export const asTimeValue = (d: Date): TimeValue => {
  const hour24 = d.getHours()
  return {
    hour: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute: d.getMinutes(),
    period: hour24 < 12 ? 'AM' : 'PM',
  }
}

export const combineDateAndTime = (dateKey: string, time: TimeValue): string => {
  const hour24 = time.period === 'AM'
    ? (time.hour === 12 ? 0 : time.hour)
    : (time.hour === 12 ? 12 : time.hour + 12)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dateKey}T${pad(hour24)}:${pad(time.minute)}:00`
}

// Shared by HistoryPage and RemindersPage for rendering an ISO timestamp's
// time-of-day next to a date-grouped entry.
export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
