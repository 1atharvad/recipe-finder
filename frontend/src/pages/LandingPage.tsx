import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BowlSteam, MagnifyingGlass, Heart, Sparkle, LockSimple, Confetti,
} from '@phosphor-icons/react'
import { LandingHeader } from '../components/LandingHeader'
import { LandingFooter } from '../components/LandingFooter'
import { PhotoCarousel } from '../components/PhotoCarousel'
import { BentoGrid } from '../components/BentoGrid'
import { recipeApi } from '../api/api'
import type { Recipe } from '../types'

const PHOTO_CARDS = [
  { img: 'photo-1473093295043-cdd812d0e601', name: 'Tomato Pasta', tag: '15 min • cozy classic' },
  { img: 'photo-1512621776951-a57141f2eefd', name: 'Veggie Salad', tag: 'Vegan • bright & crunchy' },
  { img: 'photo-1549834125-82d3c68f3a31', name: 'Garlic Bread', tag: '10 min • crispy classic' },
  { img: 'photo-1525351484163-7529414344d8', name: 'Classic Omelette', tag: '5 min • protein packed' },
  { img: 'photo-1598515213692-3ba0f02fe85a', name: 'Chicken Stir Fry', tag: 'One pan • happy leftovers' },
  { img: 'photo-1565557623262-b51c2513a641', name: 'Cucumber Raita', tag: 'Cool & refreshing' },
  { img: 'photo-1603133872878-684f208fb84b', name: 'Egg Fried Rice', tag: 'One pan • quick fix' },
  { img: 'photo-1528207776546-365bb710ee93', name: 'Banana Pancakes', tag: 'Weekend • sweet treat' },
  { img: 'photo-1547592166-23ac45744acd', name: 'Tomato Soup', tag: 'Cozy • soul warming' },
]

const FEATURES = [
  { tone: 'cream', icon: MagnifyingGlass, title: 'Smart Search', text: "Tell us what you have. We'll find something delicious." },
  { tone: 'mustard', icon: Heart, title: 'Favorites', text: 'Keep the keepers close for busy-night wins.' },
  { tone: 'peach', icon: Sparkle, title: 'Smart Picks', text: 'Get nudged toward meals that fit your mood.' },
]

const STEPS = [
  { n: '01', tone: 'cream', icon: MagnifyingGlass, title: 'Search', text: 'Type in a craving, ingredient, or "what\'s left in the fridge."' },
  { n: '02', tone: 'sage', icon: Heart, title: 'Save & Log', text: 'Save the gems and jot down what you actually made.' },
  { n: '03', tone: 'peach', icon: Sparkle, title: 'Get Smart Picks', text: 'Your taste gets sharper, so your next meal gets easier.' },
]

const TODAY_WEEKDAY = new Date().toLocaleDateString('en-US', { weekday: 'long' })

export const LandingPage = () => {
  const navigate = useNavigate()
  const [showcase, setShowcase] = useState<Recipe[]>([])

  useEffect(() => {
    recipeApi.getTop().then(setShowcase).catch(() => {})
  }, [])

  return (
    <div className="landing">
      <LandingHeader />

      <section className="landing-hero">
        <div className="section-inner hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">YOUR KITCHEN, BUT SMARTER <Sparkle weight="fill" /></span>
            <h1>What's in your kitchen?</h1>
            <p>Turn a handful of ingredients into your next favorite meal. Recipe Finder helps
              you discover, save, and actually cook the good stuff.</p>
            <div className="landing-cta-row">
              <button className="btn-pill btn-primary" onClick={() => navigate('/dashboard/search')}>
                Let's Cook! <MagnifyingGlass weight="bold" />
              </button>
              <a className="btn-link" href="#how-it-works">See how it works ↓</a>
            </div>
          </div>
          <div className="hero-preview-card">
            <BowlSteam className="hero-preview-icon" weight="duotone" />
            <div className="hero-preview-input">
              <span>Try "chickpeas + lemon"</span>
              <MagnifyingGlass className="hero-preview-search-btn" weight="bold" />
            </div>
            <p className="hero-preview-tag"><Sparkle weight="fill" /> fresh ideas, zero fridge panic</p>
          </div>
        </div>
      </section>

      <section className="photo-showcase">
        <div className="section-inner">
          <h2>A few tasty directions →</h2>
        </div>
        <PhotoCarousel cards={PHOTO_CARDS} />
      </section>

      <section id="features" className="features-section">
        <div className="section-inner">
          <h2>A little magic for every meal</h2>
          <p className="features-subtext">From first search to last bite, Recipe Finder keeps the fun in the kitchen.</p>
          <div className="features-row">
            {FEATURES.map(f => (
              <div key={f.title} className={`feature-card tone-${f.tone}`}>
                <f.icon className="feature-icon" weight="bold" />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          <button
            className="btn-pill btn-primary btn-small section-more-link"
            onClick={() => navigate('/features')}
          >
            See all features →
          </button>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-inner">
          <h2>Three tiny steps. Big tasty energy.</h2>
          <div className="steps-row">
            {STEPS.map(step => (
              <div key={step.n} className={`step-card tone-${step.tone}`}>
                <span className="step-number">{step.n}</span>
                <h3><step.icon weight="bold" /> {step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
          <button
            className="btn-pill btn-primary btn-small section-more-link"
            onClick={() => navigate('/how-it-works')}
          >
            Read the full walkthrough →
          </button>
        </div>
      </section>

      {showcase.length > 0 && (
        <section className="showcase-section">
          <div className="section-inner">
            <h2>Tonight's delicious possibilities</h2>
            <BentoGrid recipes={showcase} />
          </div>
        </section>
      )}

      <section className="real-life-section">
        <div className="section-inner">
          <span className="hero-eyebrow">HOW IT FITS INTO REAL LIFE</span>
          <h2>A little help for every kind of hungry.</h2>
          <p className="real-life-tags">
            Nearly-empty fridge <Sparkle weight="fill" /> busy {TODAY_WEEKDAY} <Sparkle weight="fill" /> favorite meals
          </p>
          <p className="real-life-subtext">Find something clever, save it before dinner panic starts, then keep the good ones close.</p>
        </div>
      </section>

      <section className="trust-strip">
        <div className="section-inner">
          <span><LockSimple weight="bold" /> Your data's safe with us — no spam, just snacks <LockSimple weight="bold" /></span>
        </div>
      </section>

      <section className="final-cta">
        <div className="section-inner">
          <h2>Stop wondering what to cook!</h2>
          <p>Your next delicious idea is only a few taps away.</p>
          <button className="btn-pill btn-cta" onClick={() => navigate('/signup')}>
            Create Free Account <Confetti weight="fill" />
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
