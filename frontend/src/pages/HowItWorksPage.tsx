import type { Icon } from '@phosphor-icons/react'
import { MagnifyingGlassIcon, HeartIcon, SparkleIcon } from '@phosphor-icons/react'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import content from '@/content/howItWorksPage.json'

const ICONS: Record<string, Icon> = { MagnifyingGlassIcon, HeartIcon, SparkleIcon }

export const HowItWorksPage = () => {
  return (
    <div className="landing">
      <LandingHeader />

      <section className="landing-hero how-it-works-hero">
        <div className="section-inner">
          <span className="hero-eyebrow">{content.hero.eyebrow} <SparkleIcon weight="fill" /></span>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.text}</p>
        </div>
      </section>

      <section className="features-section">
        <div className="section-inner how-it-works-detail">
          {content.steps.map(step => {
            const StepIcon = ICONS[step.icon]
            return (
              <div key={step.n} className={`step-card tone-${step.tone}`}>
                <span className="step-number">{step.n}</span>
                <h3><StepIcon weight="bold" /> {step.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: step.html }} />
              </div>
            )
          })}
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
