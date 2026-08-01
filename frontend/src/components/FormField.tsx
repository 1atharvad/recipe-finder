interface Props {
  label: string
  type?: string
  value: string | number
  onChange: (value: string) => void
  required?: boolean
  autoFocus?: boolean
  placeholder?: string
  minLength?: number
  min?: number
}

// Shared labeled-input pattern used across the auth forms (Login/Signup/Profile)
// and simple recipe-form fields.
export const FormField = ({ label, type = 'text', value, onChange, ...rest }: Props) => (
  <label>
    {label}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      {...rest}
    />
  </label>
)
