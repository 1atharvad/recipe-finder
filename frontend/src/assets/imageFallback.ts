import type { SyntheticEvent } from 'react'

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
