import type { Icon } from '@phosphor-icons/react'

interface Props {
  n: string
  tone: string
  icon: Icon
  title: string
  text: string
}

export const StepCard = ({ n, tone, icon: IconComponent, title, text }: Props) => (
  <div className={`step-card tone-${tone}`}>
    <span className="step-number">{n}</span>
    <h3><IconComponent weight="bold" /> {title}</h3>
    <p>{text}</p>
  </div>
)
