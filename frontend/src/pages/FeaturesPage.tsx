import {
  MagnifyingGlass, Heart, NotePencil, ClockCounterClockwise, Sparkle, Sliders, ShieldCheck,
} from '@phosphor-icons/react'
import { LandingHeader } from '../components/LandingHeader'
import { LandingFooter } from '../components/LandingFooter'

const ALL_FEATURES = [
  {
    tone: 'cream', icon: MagnifyingGlass, title: 'Smart Search',
    text: 'Search by dish name or ingredient across the general recipe pool and — once signed in — your own private recipes too.',
  },
  {
    tone: 'mustard', icon: Heart, title: 'Favorites',
    text: 'Save recipes to your account, not just your browser. They follow you across devices and show up in one place.',
  },
  {
    tone: 'peach', icon: NotePencil, title: 'My Recipes',
    text: 'Create, edit, and delete your own recipes. They stay private — visible only to you, never to other users.',
  },
  {
    tone: 'sage', icon: ClockCounterClockwise, title: 'Eating History',
    text: 'Mark a recipe as eaten and it lands in your history, grouped by date. This is what powers your recommendations.',
  },
  {
    tone: 'cream', icon: Sparkle, title: 'Smart Picks',
    text: "A scoring algorithm weighs your eating history — what you eat on this weekday, how often, how recently — to surface what you'll want next.",
  },
  {
    tone: 'mustard', icon: Sliders, title: 'Preferences',
    text: 'Set a dietary type and cuisine preference to boost matching recipes in your recommendations.',
  },
  {
    tone: 'peach', icon: ShieldCheck, title: 'Admin Panel',
    text: 'A discrete, separately authenticated panel for full CRUD over the general recipe pool. Admin credentials are never stored in the database.',
  },
]

export const FeaturesPage = () => (
  <div className="landing">
    <LandingHeader />

    <section className="landing-hero how-it-works-hero">
      <div className="section-inner">
        <span className="hero-eyebrow">EVERYTHING IN THE BOX <Sparkle weight="fill" /></span>
        <h1>Every feature, no fluff</h1>
        <p>
          Recipe Finder in full — from finding a recipe to the algorithm that learns what
          you actually cook.
        </p>
      </div>
    </section>

    <section className="features-section">
      <div className="section-inner">
        <div className="features-row features-row-full">
          {ALL_FEATURES.map(f => (
            <div key={f.title} className={`feature-card tone-${f.tone}`}>
              <f.icon className="feature-icon" weight="bold" />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <LandingFooter />
  </div>
)
