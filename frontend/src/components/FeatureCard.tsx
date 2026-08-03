import type { Icon } from '@phosphor-icons/react'

interface Props {
  tone: string
  icon: Icon
  title: string
  text: string
  badge?: string
  onClick?: () => void
}

// Shared by LandingPage, FeaturesPage, and DashboardHomePage — the same
// tone/icon/title/text card, either static or (when onClick is passed) a
// clickable navigation tile.
export const FeatureCard = ({ tone, icon: IconComponent, title, text, badge, onClick }: Props) => {
  const className = `feature-card tone-${tone}${onClick ? ' dashboard-home-card' : ''}`
  const content = (
    <>
      <IconComponent className="feature-icon" weight="bold" />
      <h3>{title}</h3>
      <p>{text}</p>
      {badge && <span className="meta-badge tone-mustard feature-card-badge">{badge}</span>}
    </>
  )
  return onClick
    ? <button className={className} onClick={onClick}>{content}</button>
    : <div className={className}>{content}</div>
}
