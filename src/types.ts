export interface ServerActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface FormContextType {
  isSubmitting: boolean
  errors: Record<string, string[]>
  values: Record<string, unknown>
  setFieldValue: (name: string, value: unknown) => void
  setErrors: (errors: Record<string, string[]>) => void
  setIsSubmitting: (isSubmitting: boolean) => void
  reset: () => void
}

export type ValidatorFn = (data: unknown) => Promise<{
  success: boolean
  errors?: Record<string, string[]>
  data?: unknown
}>

export interface UseFormSubmitOptions {
  validate?: ValidatorFn
  onSuccess?: (data: unknown) => void
  onError?: (errors: Record<string, string[]>) => void
  resetOnSuccess?: boolean
}
