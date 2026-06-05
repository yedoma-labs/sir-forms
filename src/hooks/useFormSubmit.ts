import { useCallback } from 'react'
import { useForm } from '../context/FormContext'
import type { ServerActionResult, UseFormSubmitOptions } from '../types'

export function useFormSubmit<T extends Record<string, unknown>>(
  onSubmit: (data: T) => Promise<ServerActionResult>,
  options?: UseFormSubmitOptions,
) {
  const form = useForm()
  const { validate, onSuccess, onError, resetOnSuccess = true } = options || {}

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // Prevent double submission
      if (form.isSubmitting) {
        return
      }

      // Type assertion warning: form.values should match T structure.
      // Use validate option with runtime type guard (Zod/Valibot) to ensure type safety.
      const data = form.values as T

      form.setIsSubmitting(true)
      form.setErrors({})

      try {
        // Client-side validation if provided
        if (validate) {
          const validationResult = await validate(data)
          if (!validationResult.success) {
            const validationErrors = validationResult.errors || {}
            form.setErrors(validationErrors)
            onError?.(validationErrors)
            return
          }
        }

        // Submit to server
        const result = await onSubmit(data)

        if (result.success) {
          onSuccess?.(result.data)
          if (resetOnSuccess) {
            form.reset()
          }
        } else if (result.errors) {
          form.setErrors(result.errors)
          onError?.(result.errors)
        } else if (result.error) {
          // General error (not field-specific)
          form.setErrors({ _form: [result.error] })
          onError?.({ _form: [result.error] })
        }
      } finally {
        form.setIsSubmitting(false)
      }
    },
    [form, onSubmit, validate, onSuccess, onError, resetOnSuccess],
  )

  return handleSubmit
}
