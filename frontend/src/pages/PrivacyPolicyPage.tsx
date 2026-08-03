import { LandingHeader } from '@/components/LandingHeader'
import { LandingFooter } from '@/components/LandingFooter'
import content from '@/content/privacyPage.json'

export const PrivacyPolicyPage = () => (
  <div className="landing">
    <LandingHeader />

    <section className="legal-page">
      <div className="section-inner">
        <h1>{content.title}</h1>
        <p className="legal-updated">{content.updatedLabel}: {content.updatedDate}</p>
        <p className="legal-intro">{content.intro}</p>

        {content.sections.map(section => (
          <div key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: section.html }} />
          </div>
        ))}
      </div>
    </section>

    <LandingFooter />
  </div>
)
