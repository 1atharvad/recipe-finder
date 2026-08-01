import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, Sparkle, Package } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'

const CARDS = [
  { to: '/dashboard/search', tone: 'sage', icon: MagnifyingGlass, title: 'Search', text: 'Look up a recipe by name or ingredient.' },
  { to: '/dashboard/recommender', tone: 'mustard', icon: Sparkle, title: 'Recommender', text: 'We find the recipe for you, based on your history and preferences.' },
  { to: '/dashboard/inventory', tone: 'peach', icon: Package, title: 'Inventory', text: 'Track what you have on hand. Coming soon.' },
]

export const DashboardHomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section className="dashboard-home">
      <p className="section-label">Dashboard</p>
      <h1>Welcome back{user?.firstName ? `, ${user.firstName}` : ''}</h1>
      <p className="dashboard-home-sub">Pick a starting point.</p>

      <div className="features-row">
        {CARDS.map(card => (
          <button
            key={card.to}
            className={`feature-card tone-${card.tone} dashboard-home-card`}
            onClick={() => navigate(card.to)}
          >
            <card.icon className="feature-icon" weight="bold" />
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
