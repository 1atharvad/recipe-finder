import { useNavigate } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import { MagnifyingGlass, Sparkle, Package } from '@phosphor-icons/react'
import { useAuth } from '@/context/AuthContext'
import { FeatureCard } from '@/components/FeatureCard'
import content from '@/content/dashboardHome.json'

const ICONS: Record<string, Icon> = { MagnifyingGlass, Sparkle, Package }

export const DashboardHomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section className="dashboard-home">
      <p className="section-label">{content.sectionLabel}</p>
      <h1>{content.welcomeBack}{user?.firstName ? `, ${user.firstName}` : ''}</h1>
      <p className="dashboard-home-sub">{content.subtitle}</p>

      <div className="features-row">
        {content.cards.map(card => (
          <FeatureCard
            key={card.to}
            tone={card.tone}
            icon={ICONS[card.icon]}
            title={card.title}
            text={card.text}
            onClick={() => navigate(card.to)}
          />
        ))}
      </div>
    </section>
  )
}
