import type { SyntheticEvent } from 'react'
import type { TimeValue } from '@/components/TimeWheelPicker'

// All shared, non-component helper functions for the frontend live in this
// single file rather than being split one-per-concern across assets/.

// ── Generic ──────────────────────────────────────────────────────────────

// Deterministic hash of a string into an unsigned 32-bit int (djb2-ish).
const hashString = (seed: string): number => {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  return h >>> 0
}

// Picks an item from `items` based on a hash of `seed` — same seed always
// yields the same item (stable across re-renders/reloads, no flicker), but
// unlike `index % items.length` the picks don't visibly cycle in order.
export const pickSeeded = <T,>(seed: string, items: readonly T[]): T =>
  items[hashString(seed) % items.length]

// ── Date/time ────────────────────────────────────────────────────────────
// Shared by MarkEatenModal and ScheduleModal, which both combine a
// DayPicker date + TimeWheelPicker time into a single ISO datetime string.
// Also used by HistoryPage/RemindersPage for date-grouped timelines.

export const toDateKey = (d: Date) => d.toLocaleDateString('en-CA') // YYYY-MM-DD, local time

export const todayKey = () => toDateKey(new Date())

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

// Renders an ISO timestamp's time-of-day next to a date-grouped entry.
export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// ── Images ───────────────────────────────────────────────────────────────

// Inline SVG (no network request) shown whenever a recipe/dish photo fails
// to load, so a broken-image icon never reaches the page.
export const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <rect width="480" height="480" fill="#FFF8E8"/>
  <g fill="none" stroke="#E94B35" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="240" cy="210" r="86"/>
    <path d="M240 124 v-28 M164 250 q76 64 152 0"/>
  </g>
  <text x="240" y="368" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#745C43">Image coming soon</text>
</svg>
`)}`

export const handleImageFallback = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget
  if (img.src !== FALLBACK_IMAGE) {
    img.onerror = null
    img.src = FALLBACK_IMAGE
  }
}

// A recipe with no imageUrl gets the same neutral "Image coming soon" SVG
// used for load failures, rather than a specific-but-unrelated stock photo
// that could mislead someone into thinking it's a picture of that dish.
export const getRecipeImage = (imageUrl?: string | null): string => imageUrl || FALLBACK_IMAGE

// ── YouTube ──────────────────────────────────────────────────────────────

export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1)
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.replace('/embed/', '')
      } else {
        videoId = parsed.searchParams.get('v')
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}
