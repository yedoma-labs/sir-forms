/**
 * A single value produced by {@link formDataToValues}. Repeated keys produce arrays.
 */
export type FormDataValue = string | File | Array<string | File>;

// Same keys that setFieldValue refuses, so both entry points treat them alike.
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Convert native FormData (progressive enhancement submission) into a values record
 * that matches the shape used by FormProvider.
 *
 * - Keys that appear once map to their single value.
 * - Keys that appear several times (e.g. a group of checkboxes sharing one name)
 *   map to an array, in submission order.
 * - File entries are returned as File objects.
 * - Dangerous keys (`__proto__`, `constructor`, `prototype`) are skipped.
 *
 * Unchecked checkboxes are not part of FormData at all, so they are absent from the result.
 */
export function formDataToValues(formData: FormData): Record<string, FormDataValue> {
  const collected = new Map<string, FormDataValue>();

  for (const [key, value] of formData.entries()) {
    if (UNSAFE_KEYS.has(key)) {
      continue;
    }

    const existing = collected.get(key);
    if (existing === undefined) {
      collected.set(key, value);
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      collected.set(key, [existing, value]);
    }
  }

  return Object.fromEntries(collected);
}
