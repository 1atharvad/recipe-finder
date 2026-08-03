import { ShoppingCart } from '@phosphor-icons/react'
import content from '@/content/shoppingListPage.json'

export const ShoppingListPage = () => (
  <section className="dashboard-placeholder">
    <ShoppingCart weight="bold" className="dashboard-placeholder-icon" />
    <h1>{content.title}</h1>
    <p>{content.text}</p>
    <span className="meta-badge tone-mustard">{content.badge}</span>
  </section>
)
