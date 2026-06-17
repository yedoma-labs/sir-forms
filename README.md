# Sir Forms (@yedoma-labs/sir-forms)

<picture>
  <source media="(max-width: 640px)" srcset="https://raw.githubusercontent.com/yedoma-labs/assets/main/resized/banner-resized-mobile.png">
  <img src="https://raw.githubusercontent.com/yedoma-labs/assets/main/resized/banner-resized.png" alt="Project Header">
</picture>

[![CI](https://github.com/yedoma-labs/sir-forms/actions/workflows/ci.yml/badge.svg)](https://github.com/yedoma-labs/sir-forms/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@yedoma-labs/sir-forms)](https://www.npmjs.com/package/@yedoma-labs/sir-forms)
[![npm downloads](https://img.shields.io/npm/dm/@yedoma-labs/sir-forms)](https://www.npmjs.com/package/@yedoma-labs/sir-forms)
[![Node.js](https://img.shields.io/node/v/@yedoma-labs/sir-forms)](https://www.npmjs.com/package/@yedoma-labs/sir-forms)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x+-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![License](https://img.shields.io/npm/l/@yedoma-labs/sir-forms)](LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@yedoma-labs/sir-forms)](https://bundlephobia.com/package/@yedoma-labs/sir-forms)

Type-safe React Server Actions form library with progressive enhancement. Build forms that work without JavaScript using native form submission, with seamless client-side validation and error handling.

**Sir** (сир) = "write/inscribe" in Yakut

## Features

- ✅ **Server Actions Integration** — Direct integration with React Server Components and Server Actions
- ✅ **Progressive Enhancement** — Forms work without JavaScript via native FormData
- ✅ **Validation Schema Support** — Compatible with Zod/Valibot validators
- ✅ **Error Replay** — Automatically re-populate form fields with submitted values and server validation errors
- ✅ **Field Binding** — Simple hooks-based API for field state management
- ✅ **Accessibility** — Built-in ARIA attributes for error messaging
- ✅ **Zero Dependencies** — Minimal bundle size (~9KB gzipped)
- ✅ **TypeScript First** — Full type safety across server and client

## Installation

```bash
npm install @yedoma-labs/sir-forms react
```

## Quick Start

### Basic Form with Server Action

```tsx
'use client'

import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'

export function MyForm() {
  return (
    <FormProvider initialValues={{ email: '', message: '' }}>
      <ContactForm />
    </FormProvider>
  )
}

function ContactForm() {
  const form = useForm()
  const emailField = useField('email')
  const messageField = useField('message')

  const handleSubmit = useFormSubmit(submitContactForm, {
    onSuccess: () => alert('Message sent!'),
    onError: (errors) => console.log('Validation errors:', errors),
  })

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...emailField}
        />
        {emailField.error && (
          <span id={`email-error`} role="alert">{emailField.error}</span>
        )}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          {...messageField}
        />
        {messageField.error && (
          <span id={`message-error`} role="alert">{messageField.error}</span>
        )}
      </div>

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}

// Server Action
async function submitContactForm(data: { email: string; message: string }) {
  // Validate on server
  if (!data.email.includes('@')) {
    return {
      success: false,
      errors: {
        email: ['Invalid email address'],
      },
    }
  }

  // Send email, save to DB, etc.
  await db.contactMessages.create(data)

  return { success: true, data: { id: '123' } }
}
```

## Core API

### `FormProvider`

Wraps your form and provides form state context.

```tsx
<FormProvider initialValues={{ name: '', email: '' }}>
  <YourForm />
</FormProvider>
```

**Props:**
- `initialValues?: Record<string, unknown>` — Default field values
- `children: ReactNode` — Form components

### `useForm()`

Returns form state and mutation functions.

```tsx
const form = useForm()

// State
form.values         // { name: 'John', email: 'john@example.com' }
form.errors         // { email: ['Invalid email'] }
form.isSubmitting   // boolean

// Methods
form.setFieldValue('name', 'Jane')
form.setErrors({ email: ['Already registered'] })
form.reset()
```

### `useField(name: string)`

Bind a form field with automatic state management and ARIA attributes.

```tsx
const field = useField('email')

return (
  <div>
    <input {...field} />
    {field.error && (
      <span id={`${field.name}-error`} role="alert">
        {field.error}
      </span>
    )}
  </div>
)
```

**Returns:**
- `name` — Field name
- `value` — Current field value
- `error` — First validation error (if any)
- `onChange` — Change handler
- `aria-invalid` — "true" if error exists
- `aria-describedby` — Links to error message element

### `useFormSubmit(onSubmit, options?)`

Create a form submission handler with built-in error handling and validation.

```tsx
const handleSubmit = useFormSubmit(submitAction, {
  validate: myZodSchema.parseAsync,
  onSuccess: (data) => router.push('/success'),
  onError: (errors) => console.log(errors),
})

return <form onSubmit={handleSubmit}>...</form>
```

**Options:**
- `validate?(data: unknown): Promise<ValidationResult>` — Client-side validation
- `onSuccess?(data: unknown): void` — Called after successful server submission
- `onError?(errors: Record<string, string[]>): void` — Called on validation or server errors

### `useServerAction(action)`

Wrap a Server Action with error boundary and type safety.

```tsx
const submit = useServerAction(myServerAction)

const result = await submit(data)
// result: { success: boolean, data?: T, error?: string, errors?: Record<string, string[]> }
```

## Validation with Zod

```tsx
import { z } from 'zod'

const contactSchema = z.object({
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short'),
})

function MyForm() {
  const handleSubmit = useFormSubmit(submitForm, {
    validate: (data) => contactSchema.parseAsync(data).then(
      (parsed) => ({ success: true, data: parsed }),
      (error) => ({
        success: false,
        errors: error.flatten().fieldErrors,
      })
    ),
  })

  // ... form JSX
}
```

## Progressive Enhancement (No JS)

Forms work without JavaScript because they leverage native form submission:

```tsx
<form action={submitContactForm} method="POST">
  <input name="email" type="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

Server Action receives `FormData`:

```tsx
async function submitContactForm(formData: FormData) {
  const email = formData.get('email')
  const message = formData.get('message')

  if (!isValid(email, message)) {
    return { success: false, errors: { email: ['Invalid'] } }
  }

  return { success: true }
}
```

## Architecture

```
FormProvider (state management)
├── values (field data)
├── errors (validation errors)
├── isSubmitting (submission state)
└── methods (setFieldValue, setErrors, reset)

useForm() → get state from context
useField(name) → bind input + expose field state
useFormSubmit() → handle submission + error replay
useServerAction() → call server action safely
```

## Best Practices

1. **Always provide `initialValues`** — Helps with hydration and progressive enhancement
2. **Use `useField` for inputs** — Automatically wires up state and ARIA attributes
3. **Validate server-side** — Never trust client validation alone
4. **Handle errors gracefully** — Show field-level errors and general failures
5. **Test without JavaScript** — Ensure form still works with progressive enhancement

## Project Structure

```
sir-forms/
├── src/
│   ├── index.ts                 # Main exports
│   ├── types.ts                 # Type definitions
│   ├── context/FormContext.tsx  # Form state context
│   ├── hooks/
│   │   ├── useField.ts          # Field binding hook
│   │   ├── useFormSubmit.ts     # Form submission handler
│   │   └── useServerAction.ts   # Server action wrapper
│   └── index.test.ts            # Tests
├── vite.config.ts               # Build configuration
├── tsconfig.json                # TypeScript configuration
├── biome.json                   # Code formatting/linting
└── package.json                 # Dependencies
```

## Development

```bash
# Install dependencies
pnpm install

# Build library
pnpm build

# Run tests
pnpm test

# Watch tests
pnpm test:watch

# Check types
pnpm typecheck

# Lint and format
pnpm lint
pnpm lint:fix
```

## Bundle Size

- Minified: ~14KB
- Gzipped: ~5-9KB

No runtime dependencies. Requires `react >= 18`.

## License

MIT

## Attribution

Part of the **@yedoma-labs** ecosystem:
- `bylyt-env-guard` — Environment variable validation
- `sir-forms` — Server Actions forms
- `ilte-fetch` — Type-safe HTTP client (coming soon)

Yakut naming convention: *sir* = "write/inscribe"
