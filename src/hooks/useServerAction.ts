import { useCallback } from 'react'
import type { ServerActionResult } from '../types'

/**
 * Wrap a server action with error boundary handling.
 * 
 * Error handling convention:
 * - Thrown exceptions → `error` (general error message string)
 * - Validation failures → `errors` (field-level error map)
 * 
 * Server actions should return `{ success: false, errors: {...} }` for validation failures,
 * not throw exceptions. Thrown errors will only appear as general `error` messages.
 * 
 * @example
 * const submit = useServerAction(myServerAction)
 * const result = await submit(data)
 * if (result.success) {
 *   // Handle success
 * } else if (result.errors) {
 *   // Handle field-level validation errors
 * } else if (result.error) {
 *   // Handle general error
 * }
 */
export function useServerAction<T, R>(
  action: (data: T) => Promise<ServerActionResult<R>>,
) {
  return useCallback(
    async (data: T): Promise<ServerActionResult<R>> => {
      try {
        const result = await action(data)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        return {
          success: false,
          error: message,
        }
      }
    },
    [action],
  )
}
