import { ForkKnife } from '@phosphor-icons/react'
import { Footer } from 'advi-ui'
import content from '@/content/landingFooter.json'

export const LandingFooter = () => (
  <Footer
    className="landing-footer"
    logo={{ name: content.brand, image: <ForkKnife weight="bold" />, link: { url: '/' } }}
    tagline={content.tagline}
    linkGroups={[
      {
        title: content.resourcesTitle,
        links: [
          { url: content.githubUrl, text: content.githubLabel, isExternal: true },
          { url: content.paperUrl, text: content.paperLabel, isExternal: true },
          { url: '/features', text: content.featuresLink },
          { url: '/how-it-works', text: content.howItWorksLink },
        ],
      },
      {
        title: content.legalTitle,
        links: [
          { url: '/privacy', text: content.privacyLink },
          { url: '/terms', text: content.termsLink },
        ],
      },
    ]}
    creditsPosition="top"
    credits={
      <>
        {content.creditsPrefix}{' '}
        {content.creditsSources.map((s, i) => (
          <span key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
            {i < content.creditsSources.length - 2 && ', '}
            {i === content.creditsSources.length - 2 && ', and '}
          </span>
        ))}
        {content.creditsSuffix}
      </>
    }
    copyright={`© ${new Date().getFullYear()} ${content.copyrightSuffix}`}
  />
)
