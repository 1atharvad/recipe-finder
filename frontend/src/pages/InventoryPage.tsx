import { Badge } from 'advi-ui'
import { PackageIcon } from '@phosphor-icons/react'
import content from '@/content/inventoryPage.json'

export const InventoryPage = () => (
  <section className="dashboard-placeholder">
    <PackageIcon weight="bold" className="dashboard-placeholder-icon" />
    <h1>{content.title}</h1>
    <p>{content.text}</p>
    <Badge className="meta-badge tone-mustard">{content.badge}</Badge>
  </section>
)
