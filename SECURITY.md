# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Features

### Protection Against Common Vulnerabilities

#### 1. Cross-Site Scripting (XSS)
**Protected** - React's built-in XSS protection automatically escapes all user input rendered in the DOM.

- Field values are rendered through React's controlled components
- Error messages are escaped by React when rendered
- Field names are sanitized for use in HTML attributes

#### 2. Prototype Pollution
**Protected** - Built-in safeguards prevent prototype chain manipulation through form field names.

#### 3. Double Submission Prevention
**Protected** - Forms cannot be submitted multiple times concurrently.

```typescript
// Automatic double-submission protection
if (form.isSubmitting) {
  return // Ignore duplicate submissions
}
```

#### 4. Type Safety
**Partial** - TypeScript provides compile-time type checking, but runtime validation is required.

⚠️ **Important**: Always validate user input on the server. Client-side validation can be bypassed.

```typescript
// ⚠️ Unsafe: Type assertion without validation
const data = form.values as MyType

// ✅ Safe: Use runtime validation (Zod/Valibot)
const handleSubmit = useFormSubmit(serverAction, {
  validate: async (data) => {
    const result = mySchema.safeParse(data)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, errors: result.error.flatten().fieldErrors }
  }
})
```

## Security Best Practices

### 1. Always Validate Server-Side

**Never trust client input.** Even with client-side validation, always validate in Server Actions:

```typescript
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive().max(10000),
})

export async function processPayment(data: unknown) {
  // ✅ Server-side validation
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  // Process validated data
  const { email, amount } = result.data
  // ...
}
```

### 2. Sanitize User Input for Database Queries

```typescript
// ✅ Use parameterized queries (prevents SQL injection)
await db.users.create({
  data: {
    email: data.email,  // Prisma/Drizzle handle escaping
  }
})

// ❌ Never concatenate user input into SQL
await db.query(`SELECT * FROM users WHERE email = '${data.email}'`)
```

### 3. Use HTTPS in Production

Always serve your application over HTTPS to prevent man-in-the-middle attacks:
- Form data is transmitted securely
- Session tokens are protected
- Server Actions are encrypted

### 4. Implement Rate Limiting

Protect Server Actions from abuse:

```typescript
import rateLimit from '@/lib/rate-limit'

export async function submitContactForm(data: FormData) {
  // Rate limit by IP
  const identifier = await getClientIP()
  const { success } = await rateLimit(identifier, {
    interval: 60 * 1000,  // 1 minute
    limit: 5,              // 5 requests
  })

  if (!success) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
    }
  }

  // Process form...
}
```

### 5. Validate File Uploads

If handling file uploads:

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, errors: { avatar: ['File too large (max 5MB)'] } }
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, errors: { avatar: ['Invalid file type'] } }
  }

  // Validate file content (check magic bytes, not just extension)
  const buffer = await file.arrayBuffer()
  const isValid = await verifyImageMagicBytes(buffer)
  
  if (!isValid) {
    return { success: false, errors: { avatar: ['Invalid image file'] } }
  }

  // Process upload...
}
```

### 6. Implement CSRF Protection

Next.js Server Actions have built-in CSRF protection. Ensure it's enabled:

```typescript
// next.config.js
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['yourdomain.com'],
    },
  },
}
```

### 7. Sanitize HTML Output

If you need to render user-generated HTML (not recommended):

```typescript
import DOMPurify from 'isomorphic-dompurify'

// ❌ Dangerous: Renders raw HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe: Sanitize before rendering
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 8. Handle Sensitive Data

```typescript
// ❌ Don't log sensitive data
console.log('User submitted:', data) // May contain passwords

// ✅ Log safely
console.log('Form submitted for user:', data.email)

// ✅ Don't store plaintext passwords
const hashedPassword = await bcrypt.hash(password, 10)
await db.users.create({ password: hashedPassword })
```

## Reporting a Vulnerability

If you discover a security vulnerability in sir-forms, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Use GitHub Security Advisories (preferred): https://github.com/yedoma-labs/sir-forms/security/advisories/new
3. Or create a private disclosure through your GitHub account
4. Include:
   - Description of the vulnerability
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 72 hours.

## Security Checklist for Developers

- [ ] ✅ Server-side validation implemented (Zod/Valibot)
- [ ] ✅ HTTPS enabled in production
- [ ] ✅ Rate limiting on sensitive endpoints
- [ ] ✅ CSRF protection enabled (Next.js default)
- [ ] ✅ User input sanitized before database queries
- [ ] ✅ Passwords hashed (bcrypt/argon2)
- [ ] ✅ File uploads validated (size, type, content)
- [ ] ✅ Error messages don't leak sensitive info
- [ ] ✅ Logging excludes sensitive data
- [ ] ✅ Dependencies regularly updated (`npm audit`)

## Security Updates

Check for security updates regularly:

```bash
npm audit
npm audit fix
```

Keep sir-forms and dependencies up to date.
