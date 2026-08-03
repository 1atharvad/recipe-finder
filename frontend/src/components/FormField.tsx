import { useId, useState } from 'react'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { Input } from 'advi-ui'

interface Props {
  label: string
  type?: string
  value: string | number
  onChange: (value: string) => void
  required?: boolean
  autoFocus?: boolean
  placeholder?: string
  minLength?: number
  min?: number | string
  max?: number | string
}

// Shared labeled-input pattern used across the auth forms (Login/Signup/Profile)
// and simple recipe-form fields.
export const FormField = ({ label, type = 'text', value, onChange, ...rest }: Props) => {
  const [showPassword, setShowPassword] = useState(false)
  const id = useId()

  if (type === 'password') {
    return (
      <div className="password-field">
        <label htmlFor={id}>{label}</label>
        <div className="password-input-row">
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="app-input"
            {...rest}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <Input
      label={label}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="app-input"
      {...rest}
    />
  )
}
