// Field-level validation helpers for the registration form.
// These return an error message string when invalid, or an empty string when valid.
// Keeping validation pure and separate makes the form component easy to read.

/** Name must be present and at least 2 characters once trimmed. */
export function validateName(value: string): string {
  if (!value.trim()) return 'Name is required.'
  if (value.trim().length < 2) return 'Name must be at least 2 characters.'
  return ''
}

// Pragmatic email check: something@something.tld. Not RFC-strict, good enough for a form.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Email is required and must match the basic shape above. */
export function validateEmail(value: string): string {
  if (!value.trim()) return 'Email is required.'
  if (!EMAIL_RE.test(value.trim())) return 'Please enter a valid email address.'
  return ''
}

/** Password is required and must be at least 8 characters. */
export function validatePassword(value: string): string {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  return ''
}

/** Confirm password must match the given password. */
export function validateConfirmPassword(value: string, password: string): string {
  if (!value) return 'Please confirm your password.'
  if (value !== password) return 'Passwords do not match.'
  return ''
}

// Phone: strip everything but digits, require between 7 and 15 of them.
const DIGITS_RE = /\D/g

/** Phone is required; after stripping non-digits it must have 7–15 digits. */
export function validatePhone(value: string): string {
  if (!value.trim()) return 'Phone number is required.'
  const digits = value.replace(DIGITS_RE, '')
  if (digits.length < 7) return 'Phone number is too short.'
  if (digits.length > 15) return 'Phone number is too long.'
  return ''
}

export type StrengthLevel = 'weak' | 'fair' | 'strong'

export interface PasswordStrength {
  score: number // 0–4
  level: StrengthLevel
}

/**
 * Score the password by variety + length:
 *  +1 lowercase, +1 uppercase, +1 digit, +1 symbol, +1 for length >= 12.
 * Mapped to weak (0–1), fair (2–3), strong (4–5).
 */
export function passwordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, level: 'weak' }

  let score = 0
  if (/[a-z]/.test(value)) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^a-zA-Z0-9]/.test(value)) score++
  if (value.length >= 12) score++

  const level: StrengthLevel =
    score >= 4 ? 'strong' : score >= 2 ? 'fair' : 'weak'
  return { score, level }
}
