import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import {
  BowlSteamIcon, MagnifyingGlassIcon, HeartIcon, SparkleIcon, LockSimpleIcon, ConfettiIcon,
} from '@phosphor-icons/react'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { PhotoCarousel } from '@/components/PhotoCarousel'
import { BentoGrid } from '@/components/BentoGrid'
import { FeatureCard } from '@/components/FeatureCard'
import { StepCard } from '@/components/StepCard'
import { recipeApi } from '@/api/api'
import { useAuth } from '@/context/AuthContext'
import type { Recipe } from '@/types'
import content from '@/content/landingPage.json'

const ICONS: Record<string, Icon> = { MagnifyingGlass: MagnifyingGlassIcon, Heart: HeartIcon, Sparkle: SparkleIcon }

const TODAY_WEEKDAY = new Date().toLocaleDateString('en-US', { weekday: 'long' })

export const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
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
            <span className="hero-eyebrow">{content.hero.eyebrow} <SparkleIcon weight="fill" /></span>
            <h1>{content.hero.title}</h1>
            <p>{content.hero.text}</p>
            <div className="landing-cta-row">
              <button className="btn-pill btn-primary" onClick={() => navigate('/dashboard')}>
                {content.hero.ctaLabel} <MagnifyingGlassIcon weight="bold" />
              </button>
              <a className="btn-link" href="#how-it-works">{content.hero.howItWorksLink}</a>
            </div>
          </div>
          <div className="hero-preview-card">
            <BowlSteamIcon className="hero-preview-icon" weight="duotone" />
            <div className="hero-preview-input">
              <span>{content.hero.previewPlaceholder}</span>
              <MagnifyingGlassIcon className="hero-preview-search-btn" weight="bold" />
            </div>
            <p className="hero-preview-tag"><SparkleIcon weight="fill" /> {content.hero.previewTag}</p>
          </div>
        </div>
      </section>

      <section className="photo-showcase">
        <div className="section-inner">
          <h2>{content.photoShowcase.title}</h2>
        </div>
        <PhotoCarousel cards={content.photoCards} />
      </section>

      <section id="features" className="features-section">
        <div className="section-inner">
          <h2>{content.featuresSection.title}</h2>
          <p className="features-subtext">{content.featuresSection.subtext}</p>
          <div className="features-row">
            {content.features.map(f => (
              <FeatureCard key={f.title} tone={f.tone} icon={ICONS[f.icon]} title={f.title} text={f.text} badge={f.badge} />
            ))}
          </div>
          <button
            className="btn-pill btn-primary btn-small section-more-link"
            onClick={() => navigate('/features')}
          >
            {content.featuresSection.moreLink}
          </button>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-inner">
          <h2>{content.howItWorksSection.title}</h2>
          <div className="steps-row">
            {content.steps.map(step => (
              <StepCard key={step.n} n={step.n} tone={step.tone} icon={ICONS[step.icon]} title={step.title} text={step.text} />
            ))}
          </div>
          <button
            className="btn-pill btn-primary btn-small section-more-link"
            onClick={() => navigate('/how-it-works')}
          >
            {content.howItWorksSection.moreLink}
          </button>
        </div>
      </section>

      {showcase.length > 0 && (
        <section className="showcase-section">
          <div className="section-inner">
            <h2>{content.showcaseSection.title}</h2>
            <BentoGrid recipes={showcase} />
          </div>
        </section>
      )}

      <section className="real-life-section">
        <div className="section-inner">
          <span className="hero-eyebrow">{content.realLifeSection.eyebrow}</span>
          <h2>{content.realLifeSection.title}</h2>
          <p className="real-life-tags">
            {content.realLifeSection.tagsPrefix} <SparkleIcon weight="fill" /> {content.realLifeSection.tagsMiddle} {TODAY_WEEKDAY} <SparkleIcon weight="fill" /> {content.realLifeSection.tagsSuffix}
          </p>
          <p className="real-life-subtext">{content.realLifeSection.subtext}</p>
        </div>
      </section>

      <section className="trust-strip">
        <div className="section-inner">
          <span><LockSimpleIcon weight="bold" /> {content.trustStrip.text} <LockSimpleIcon weight="bold" /></span>
        </div>
      </section>

      <section className="final-cta">
        <div className="section-inner">
          <h2>{content.finalCta.title}</h2>
          <p>{content.finalCta.text}</p>
          <button className="btn-pill btn-cta" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}>
            {isAuthenticated ? content.finalCta.ctaLabelAuthenticated : content.finalCta.ctaLabelAnonymous} <ConfettiIcon weight="fill" />
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
