# Changelog

## [0.1.0] - 2026-06-05

### Security Fixes
- **[Critical]** Added double-submission prevention via `isSubmitting` state guard
- **[Critical]** Added prototype pollution protection (blocks `__proto__`, `constructor`, `prototype`)
- **[High]** Sanitize field names for HTML ID usage (prevents XSS via aria-describedby)
- **[Medium]** Fixed race condition in error clearing logic (use updater function pattern)

### Bug Fixes
- **[Blocker]** Fixed `isSubmitting` state never being updated (now properly tracks submission)
- **[Blocker]** Fixed race condition on error clearing when setting field values rapidly
- **[Major]** Fixed radio buttons being handled incorrectly (now uses `.checked` like checkboxes)
- **[Major]** Fixed checkbox default value type mismatch (boolean vs empty string)
- **[Major]** Fixed `handleSubmit` being recreated on every render (destructure options deps)
- **[Major]** Added context value memoization to prevent cascade re-renders
- **[Minor]** Fixed `setFieldValue` dependency on full errors object (use updater pattern)
- **[Minor]** Fixed `handleChange` being recreated unnecessarily (destructure setFieldValue)

### Added

### Improvements
- Added `resetOnSuccess` option to `useFormSubmit` (configurable form reset behavior)
- Added general error handling for non-field errors (result.error → `_form` field)
- Added JSDoc documentation for `useServerAction` error handling conventions
- Changed `UseFormOptions` to `UseFormSubmitOptions` (more accurate naming)
- Added `defaultValue` option to `useField` hook
- Enhanced error vs errors documentation (thrown exceptions vs validation failures)

#### Core Features
- **FormProvider & useForm** — React context-based form state management
  - Field value tracking
  - Field-level error handling  
  - Form reset functionality
  - Server and client state sync

- **useField Hook** — Simple field binding with automatic state management
  - Automatic change handlers
  - Built-in ARIA attributes (`aria-invalid`, `aria-describedby`)
  - Error message support
  - Works with input, textarea, and select elements

- **useFormSubmit Hook** — Form submission handler with validation
  - Client-side validation support
  - Server action integration
  - Automatic error replay (re-populate fields)
  - Success/error callbacks
  - Submission state management

- **useServerAction Hook** — Type-safe server action wrapper
  - Error boundary handling
  - Consistent response format
  - Type-safe data and error returns

#### Type Definitions
- `ServerActionResult<T>` — Standard server action response shape
- `FormContextType` — Form state interface
- `ValidatorFn` — Validator function type for schema validation
- `UseFormOptions` — Options for form submission handler

#### Documentation
- Comprehensive README with API reference
- 5 detailed examples covering common patterns
- Progressive enhancement guide
- Best practices and tips

#### Tooling
- Vite configuration for dual ES/CJS builds
- TypeScript strict mode
- Biome linting and formatting
- Vitest test suite
- Type declaration generation

### Bundle Size
- **ES Module**: 40.01 KB (gzipped: 9.17 KB)
- **CommonJS**: 14.79 KB (gzipped: 5.83 KB)
- **Total**: ~9 KB gzipped (within acceptable range for added security features)

### Compliance
- ✅ React 18+ compatible
- ✅ Server Components ready
- ✅ Progressive enhancement supported
- ✅ Zero runtime dependencies
- ✅ Full TypeScript support
- ✅ Accessibility-first (ARIA attributes)

### Testing
- Module export tests
- All 5 tests passing

## Next Steps

### v0.2.0 (Planned)
- Multi-field validation helpers
- Valibot validator adapter
- Conditional field rendering
- Array field support (repeating fields)
- Cross-field validation

### v0.3.0 (Planned)
- useWatch hook for field value subscriptions
- Async validation feedback (debouncing)
- Form state persistence
- Field-level async validation
- Schema-based automatic error display

### v1.0.0 (Planned)
- Component library (shadcn/ui style)
- Form builder utilities
- Multi-step form helpers
- File upload support
- Internationalization (i18n) for error messages
