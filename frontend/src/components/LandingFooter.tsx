import { ForkKnife } from '@phosphor-icons/react'
import content from '@/content/landingFooter.json'

export const LandingFooter = () => (
  <footer className="landing-footer">
    <div className="section-inner footer-top">
      <div>
        <div className="footer-brand"><ForkKnife weight="bold" /> {content.brand}</div>
        <p className="footer-tagline">{content.tagline}</p>
      </div>
      <div className="footer-links">
        <a href={content.githubUrl} target="_blank" rel="noreferrer">{content.githubLabel}</a>
        <a href={content.paperUrl} target="_blank" rel="noreferrer">{content.paperLabel}</a>
        <a href="/features">{content.featuresLink}</a>
        <a href="/how-it-works">{content.howItWorksLink}</a>
      </div>
    </div>
    <p className="footer-copyright">© {new Date().getFullYear()} {content.copyrightSuffix}</p>
  </footer>
)
