import { MagnifyingGlass, Heart, Sparkle } from '@phosphor-icons/react'
import { LandingHeader } from '../components/LandingHeader'
import { LandingFooter } from '../components/LandingFooter'

export const HowItWorksPage = () => {
  return (
    <div className="landing">
      <LandingHeader />

      <section className="landing-hero how-it-works-hero">
        <div className="section-inner">
          <span className="hero-eyebrow">THE FULL WALKTHROUGH <Sparkle weight="fill" /></span>
          <h1>How Recipe Finder works</h1>
          <p>
            Three simple steps take you from "what do I even have" to a plate of something you'll
            actually want to eat.
          </p>
        </div>
      </section>

      <section className="features-section">
        <div className="section-inner how-it-works-detail">
          <div className="step-card tone-cream">
            <span className="step-number">01</span>
            <h3><MagnifyingGlass weight="bold" /> Search</h3>
            <p>
              Look up a dish by name, or just type whatever ingredients you've got — search
              matches against both. Every result shows servings, ingredients, steps, and dietary
              and cuisine tags at a glance.
            </p>
            <p>
              Once you're signed in, search also includes your own private recipes alongside the
              general pool, so your own cooking shows up right next to everyone else's.
            </p>
          </div>

          <div className="step-card tone-sage">
            <span className="step-number">02</span>
            <h3><Heart weight="bold" /> Save &amp; Log</h3>
            <p>
              <strong>Favorites</strong> save a recipe to your account — not just your browser, so
              they follow you across devices. <strong>My Recipes</strong> lets you write up your
              own dishes, visible only to you.
            </p>
            <p>
              Mark a recipe as eaten and it lands in your <strong>History</strong>, grouped by
              date. That history isn't just a log — it's what powers step three.
            </p>
          </div>

          <div className="step-card tone-peach">
            <span className="step-number">03</span>
            <h3><Sparkle weight="bold" /> Get Smart Picks</h3>
            <p>
              Every recipe in the general pool gets scored against your eating history:
            </p>
            <p className="score-formula">
              score = dayAffinity + frequencyWeight − recencyPenalty + preferenceBonus
            </p>
            <ul className="score-breakdown">
              <li><strong>dayAffinity</strong> — surfaces recipes you tend to eat on this weekday</li>
              <li><strong>frequencyWeight</strong> — favors recipes you eat often</li>
              <li><strong>recencyPenalty</strong> — discourages repeating something you just had</li>
              <li><strong>preferenceBonus</strong> — boosts matches to your dietary &amp; cuisine preferences</li>
            </ul>
            <p>The top 10 scored recipes show up on your <strong>Recommender</strong> page.</p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
