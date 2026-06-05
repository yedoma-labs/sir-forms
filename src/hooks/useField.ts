import { useCallback, useMemo } from 'react'
import { useForm } from '../context/FormContext'

/**
 * Sanitize field name for use in HTML IDs.
 * Prevents XSS by removing/escaping invalid characters.
 * Valid HTML ID: alphanumeric, hyphen, underscore, colon, period (no spaces or special chars)
 */
function sanitizeFieldName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_:-]/g, '_')
}

export function useField(name: string, options?: { defaultValue?: unknown }) {
  const form = useForm()
  const { setFieldValue } = form
  
  // Sanitize field name for HTML ID usage (security: prevent XSS via malicious field names)
  const fieldId = useMemo(() => sanitizeFieldName(name), [name])
  
  // Default value handling: preserve type (boolean for checkboxes, string otherwise)
  const rawValue = form.values[name]
  const value = rawValue !== undefined ? rawValue : (options?.defaultValue ?? '')
  const error = form.errors[name]?.[0]

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target
      // Handle checkboxes and radio buttons (use .checked)
      const fieldValue =
        target.type === 'checkbox' || target.type === 'radio'
          ? (target as HTMLInputElement).checked
          : target.value
      setFieldValue(name, fieldValue)
    },
    [setFieldValue, name],
  )

  return {
    name,
    value,
    error,
    onChange: handleChange,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? `${fieldId}-error` : undefined,
  }
}
