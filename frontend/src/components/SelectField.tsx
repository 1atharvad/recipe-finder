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
  <label>
    {label}
    <select value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
)
