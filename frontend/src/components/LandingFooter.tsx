import { ForkKnife } from '@phosphor-icons/react'

export const LandingFooter = () => (
  <footer className="landing-footer">
    <div className="section-inner footer-top">
      <div>
        <div className="footer-brand"><ForkKnife weight="bold" /> Recipe Finder</div>
        <p className="footer-tagline">Good food starts with a little curiosity.</p>
      </div>
      <div className="footer-links">
        <a href="https://github.com/1atharvad/recipe-finder" target="_blank" rel="noreferrer">GitHub</a>
        <a href="/features">Features</a>
        <a href="/how-it-works">How it works</a>
      </div>
    </div>
    <p className="footer-copyright">© {new Date().getFullYear()} Recipe Finder — made for hungry humans.</p>
  </footer>
)
