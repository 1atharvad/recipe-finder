import { CookingPotIcon } from '@phosphor-icons/react'
import content from '@/content/mealPrepPage.json'

export const MealPrepPage = () => (
  <section className="dashboard-placeholder">
    <CookingPotIcon weight="bold" className="dashboard-placeholder-icon" />
    <h1>{content.title}</h1>
    <p>{content.text}</p>
    <span className="meta-badge tone-mustard">{content.badge}</span>
  </section>
)
