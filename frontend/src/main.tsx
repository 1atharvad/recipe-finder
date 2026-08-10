import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// TEMP: advi-ui@0.6.0's published dist is missing base.css/theme files (only
// the combined bundle shipped) — using the combined export until that's
// republished. Switch back to 'advi-ui/base' once base.css exists again.
import 'advi-ui/styles'
import './index.scss'
import { App } from '@/App.tsx'
// Vercel Analytics — lightweight web analytics (https://vercel.com/docs/analytics)
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
