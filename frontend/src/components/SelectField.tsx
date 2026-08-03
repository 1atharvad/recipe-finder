import { CaretDown, Check } from '@phosphor-icons/react'
import { Select } from 'advi-ui'

interface Option {
  value: string
  label: string
}

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
}

// Shared label+select pattern used by RecipeFormModal and PreferencesModal
// for the dietary/cuisine dropdowns.
export const SelectField = ({ label, value, onChange, options }: Props) => (
  <Select
    label={label}
    value={value}
    onChange={onChange}
    options={options}
    chevronIcon={<CaretDown />}
    checkIcon={<Check />}
  />
)
