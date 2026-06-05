# Sir Forms — Usage Examples

## Example 1: Simple Contact Form

```tsx
'use client'

import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'

export function ContactForm() {
  return (
    <FormProvider initialValues={{ name: '', email: '', message: '' }}>
      <ContactFormContent />
    </FormProvider>
  )
}

function ContactFormContent() {
  const form = useForm()
  const nameField = useField('name')
  const emailField = useField('email')
  const messageField = useField('message')

  const handleSubmit = useFormSubmit(sendContactMessage, {
    onSuccess: () => {
      alert('Thank you! We received your message.')
      form.reset()
    },
  })

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input
          id="name"
          type="text"
          required
          {...nameField}
          className="mt-1 block w-full rounded border-gray-300"
        />
        {nameField.error && (
          <p id={`${nameField.name}-error`} className="text-red-600 text-sm mt-1">
            {nameField.error}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          {...emailField}
          className="mt-1 block w-full rounded border-gray-300"
        />
        {emailField.error && (
          <p id={`${emailField.name}-error`} className="text-red-600 text-sm mt-1">
            {emailField.error}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium">Message</label>
        <textarea
          id="message"
          required
          rows={5}
          {...messageField}
          className="mt-1 block w-full rounded border-gray-300"
        />
        {messageField.error && (
          <p id={`${messageField.name}-error`} className="text-red-600 text-sm mt-1">
            {messageField.error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={form.isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {form.isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

// Server Action (actions/contact.ts)
'use server'

export async function sendContactMessage(data: { name: string; email: string; message: string }) {
  // Validate
  if (!data.name.trim()) {
    return { success: false, errors: { name: ['Name is required'] } }
  }
  if (!data.email.includes('@')) {
    return { success: false, errors: { email: ['Valid email required'] } }
  }
  if (data.message.length < 10) {
    return { success: false, errors: { message: ['Message must be at least 10 characters'] } }
  }

  // Send email
  try {
    await sendEmail({
      to: 'support@example.com',
      subject: `New message from ${data.name}`,
      body: `From: ${data.email}\n\n${data.message}`,
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}
```

## Example 2: Form with Zod Validation

```tsx
'use client'

import { z } from 'zod'
import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'

const userSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

export function SignupForm() {
  return (
    <FormProvider initialValues={{ username: '', email: '', password: '' }}>
      <SignupFormContent />
    </FormProvider>
  )
}

function SignupFormContent() {
  const form = useForm()
  const usernameField = useField('username')
  const emailField = useField('email')
  const passwordField = useField('password')

  const handleSubmit = useFormSubmit(signup, {
    validate: async (data) => {
      try {
        await userSchema.parseAsync(data)
        return { success: true, data }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            errors: error.flatten().fieldErrors as Record<string, string[]>,
          }
        }
        return { success: false, errors: {} }
      }
    },
    onSuccess: () => {
      window.location.href = '/dashboard'
    },
    onError: (errors) => {
      console.error('Signup validation failed:', errors)
    },
  })

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      <FormField field={usernameField} label="Username" type="text" />
      <FormField field={emailField} label="Email" type="email" />
      <FormField field={passwordField} label="Password" type="password" />

      <button
        type="submit"
        disabled={form.isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {form.isSubmitting ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}

// Reusable field component
function FormField({ field, label, type = 'text' }: { 
  field: any
  label: string
  type?: string 
}) {
  return (
    <div>
      <label htmlFor={field.name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={field.name}
        type={type}
        {...field}
        className={`w-full px-3 py-2 border rounded ${
          field.error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {field.error && (
        <p id={`${field.name}-error`} className="text-red-600 text-sm mt-1">
          {field.error}
        </p>
      )}
    </div>
  )
}

// Server Action
'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function signup(data: { username: string; email: string; password: string }) {
  // Check if user exists
  const existing = await db.users.findUnique({ where: { email: data.email } })
  if (existing) {
    return {
      success: false,
      errors: { email: ['Email already registered'] },
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Create user
  try {
    await db.users.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    }
  }
}
```

## Example 3: Multi-Step Form (Wizard)

```tsx
'use client'

import { useState } from 'react'
import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'

export function RegistrationWizard() {
  const [step, setStep] = useState(1)

  return (
    <FormProvider initialValues={{
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
    }}>
      {step === 1 && <PersonalInfoStep onNext={() => setStep(2)} />}
      {step === 2 && <ContactInfoStep onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <AddressStep onBack={() => setStep(2)} />}
    </FormProvider>
  )
}

function PersonalInfoStep({ onNext }: { onNext: () => void }) {
  const form = useForm()
  const firstNameField = useField('firstName')
  const lastNameField = useField('lastName')

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      <div className="space-y-4">
        <input {...firstNameField} placeholder="First Name" required />
        <input {...lastNameField} placeholder="Last Name" required />
        <button
          type="button"
          onClick={onNext}
          disabled={!form.values.firstName || !form.values.lastName}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function ContactInfoStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const form = useForm()
  const emailField = useField('email')
  const phoneField = useField('phone')

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
      <div className="space-y-4">
        <input {...emailField} type="email" placeholder="Email" required />
        <input {...phoneField} type="tel" placeholder="Phone" required />
        <div className="flex gap-2">
          <button type="button" onClick={onBack}>Back</button>
          <button
            type="button"
            onClick={onNext}
            disabled={!form.values.email || !form.values.phone}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

function AddressStep({ onBack }: { onBack: () => void }) {
  const form = useForm()
  const addressField = useField('address')
  const cityField = useField('city')
  const zipCodeField = useField('zipCode')

  const handleSubmit = useFormSubmit(submitRegistration, {
    onSuccess: () => alert('Registration complete!'),
  })

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Address</h2>
      <div className="space-y-4">
        <input {...addressField} placeholder="Address" required />
        <input {...cityField} placeholder="City" required />
        <input {...zipCodeField} placeholder="Zip Code" required />
        <div className="flex gap-2">
          <button type="button" onClick={onBack}>Back</button>
          <button type="submit">{form.isSubmitting ? 'Submitting...' : 'Complete'}</button>
        </div>
      </div>
    </form>
  )
}

'use server'
export async function submitRegistration(data: Record<string, unknown>) {
  // Save to database
  return { success: true }
}
```

## Example 4: Product Form with Images

```tsx
'use client'

import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'

export function ProductForm() {
  return (
    <FormProvider initialValues={{ name: '', price: '', description: '', image: '' }}>
      <ProductFormContent />
    </FormProvider>
  )
}

function ProductFormContent() {
  const form = useForm()
  const nameField = useField('name')
  const priceField = useField('price')
  const descriptionField = useField('description')

  const handleSubmit = useFormSubmit(createProduct, {
    validate: async (data) => {
      const errors: Record<string, string[]> = {}
      if (!data.name) errors.name = ['Name is required']
      if (!data.price || Number(data.price) <= 0) errors.price = ['Valid price is required']
      if (!data.description || (data.description as string).length < 20) {
        errors.description = ['Description must be at least 20 characters']
      }
      return Object.keys(errors).length > 0
        ? { success: false, errors }
        : { success: true, data }
    },
    onSuccess: (result: any) => {
      alert(`Product created: ${result.id}`)
      form.reset()
    },
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Product Name</label>
        <input type="text" {...nameField} required />
        {nameField.error && <p className="text-red-600">{nameField.error}</p>}
      </div>

      <div>
        <label>Price</label>
        <input type="number" step="0.01" {...priceField} required />
        {priceField.error && <p className="text-red-600">{priceField.error}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea {...descriptionField} rows={5} required />
        {descriptionField.error && <p className="text-red-600">{descriptionField.error}</p>}
      </div>

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  )
}

'use server'
export async function createProduct(data: Record<string, unknown>) {
  // Validate and save
  const product = await db.products.create({
    data: {
      name: data.name as string,
      price: Number(data.price),
      description: data.description as string,
    },
  })
  return { success: true, data: { id: product.id } }
}
```

## Example 5: Newsletter Signup with Progressive Enhancement

This form works **without JavaScript**:

```tsx
// app/components/NewsletterSignup.tsx
'use client'

import { FormProvider, useForm, useField, useFormSubmit } from '@yedoma-labs/sir-forms'

export function NewsletterSignup() {
  return (
    <FormProvider initialValues={{ email: '' }}>
      <NewsletterForm />
    </FormProvider>
  )
}

function NewsletterForm() {
  const form = useForm()
  const emailField = useField('email')

  const handleSubmit = useFormSubmit(subscribeNewsletter, {
    onSuccess: () => alert('Welcome to our newsletter!'),
  })

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        placeholder="Enter your email"
        required
        {...emailField}
        className="flex-1 px-4 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={form.isSubmitting}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {form.isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>
      {emailField.error && (
        <span role="alert" className="text-red-600 text-sm">
          {emailField.error}
        </span>
      )}
    </form>
  )
}

'use server'

export async function subscribeNewsletter(data: { email: string }) {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return {
      success: false,
      errors: { email: ['Please enter a valid email address'] },
    }
  }

  // Check if already subscribed
  const existing = await db.newsletter.findUnique({ where: { email: data.email } })
  if (existing) {
    return {
      success: false,
      errors: { email: ['This email is already subscribed'] },
    }
  }

  // Subscribe
  await db.newsletter.create({ data: { email: data.email } })
  return { success: true }
}
```

Works without JS:

```html
<form action={subscribeNewsletter} method="POST" class="flex gap-2">
  <input type="email" name="email" placeholder="Enter your email" required />
  <button type="submit">Subscribe</button>
</form>
```

## Tips

- **Always use `initialValues`** for better UX and progressive enhancement
- **Validate on both client and server** — client for UX, server for security
- **Show field-level errors** using the `error` property from `useField`
- **Use `disabled` on submit button** while submitting
- **Test without JavaScript** to ensure progressive enhancement works
