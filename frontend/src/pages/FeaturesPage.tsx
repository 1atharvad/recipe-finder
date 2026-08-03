import type { Icon } from '@phosphor-icons/react'
import {
  MagnifyingGlassIcon, HeartIcon, NotePencilIcon, ClockCounterClockwiseIcon, SparkleIcon, SlidersIcon,
  BellRingingIcon, PackageIcon, ShoppingCartIcon, CookingPotIcon,
} from '@phosphor-icons/react'
import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import { FeatureCard } from '@/components/FeatureCard'
import content from '@/content/featuresPage.json'

const ICONS: Record<string, Icon> = {
  MagnifyingGlass: MagnifyingGlassIcon, Heart: HeartIcon, NotePencil: NotePencilIcon,
  ClockCounterClockwise: ClockCounterClockwiseIcon, Sparkle: SparkleIcon, Sliders: SlidersIcon,
  BellRinging: BellRingingIcon, Package: PackageIcon, ShoppingCart: ShoppingCartIcon, CookingPot: CookingPotIcon,
}

export const FeaturesPage = () => (
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
      <div className="section-inner">
        <div className="features-row features-row-full">
          {content.features.map(f => (
            <FeatureCard key={f.title} tone={f.tone} icon={ICONS[f.icon]} title={f.title} text={f.text} badge={f.badge} />
          ))}
        </div>
      </div>
    </section>

    <LandingFooter />
  </div>
)
