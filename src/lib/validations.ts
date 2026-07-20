// Field-level validation helpers for the job application form.
// Each validator returns an error string when invalid, or '' when valid.
// Keeping validation pure and separate keeps the form component readable.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https:\/\/.+\..+/i

/** Full name is required and at least 2 chars once trimmed. */
export function validateFullName(value: string): string {
  if (!value.trim()) return 'Full name is required.'
  if (value.trim().length < 2) return 'Name must be at least 2 characters.'
  return ''
}

/** Email is required and must match the basic shape. */
export function validateEmail(value: string): string {
  if (!value.trim()) return 'Email is required.'
  if (!EMAIL_RE.test(value.trim())) return 'Please enter a valid email address.'
  return ''
}

/** Phone is optional but, if given, must have 7–15 digits once non-digits are stripped. */
const DIGITS_RE = /\D/g
export function validatePhoneOptional(value: string): string {
  if (!value.trim()) return '' // optional
  const digits = value.replace(DIGITS_RE, '')
  if (digits.length < 7) return 'Phone number is too short.'
  if (digits.length > 15) return 'Phone number is too long.'
  return ''
}

/** Position is required and must be one of the open roles. */
export function validatePosition(value: string, openRoles: readonly string[]): string {
  if (!value) return 'Please select a role.'
  if (!openRoles.includes(value)) return 'That role is not currently open.'
  return ''
}

/** Years of experience is required and must be a number in [0, 60]. */
export function validateYears(value: string): string {
  if (value.trim() === '') return 'Years of experience is required.'
  const n = Number(value)
  if (!Number.isFinite(n)) return 'Enter a number.'
  if (n < 0) return 'Experience cannot be negative.'
  if (n > 60) return 'Please enter a realistic number of years (0–60).'
  return ''
}

/** Portfolio/LinkedIn URL is optional but, if given, must be https://... */
export function validateUrl(value: string): string {
  if (!value.trim()) return ''
  if (!URL_RE.test(value.trim())) return 'URL must start with https://'
  return ''
}

/** Cover letter is required and must be at least MIN chars (so it carries real content). */
export const COVER_LETTER_MIN = 80
export function validateCoverLetter(value: string): string {
  if (!value.trim()) return 'Cover letter is required.'
  if (value.trim().length < COVER_LETTER_MIN)
    return `Cover letter must be at least ${COVER_LETTER_MIN} characters (you have ${value.trim().length}).`
  return ''
}

/** Availability is required and must be a known option. */
export const AVAILABILITY_OPTIONS = ['Immediately', '2 weeks', '1 month', '2+ months'] as const
export type Availability = (typeof AVAILABILITY_OPTIONS)[number]
export function validateAvailability(value: string): string {
  if (!value) return 'Please select when you can start.'
  if (!(AVAILABILITY_OPTIONS as readonly string[]).includes(value))
    return 'Select a valid availability option.'
  return ''
}

/** Resume file is required, must be PDF or DOCX, and under 5 MB. */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024
export const ACCEPTED_RESUME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
export function validateResume(file: File | null): string {
  if (!file) return 'Please upload your resume.'
  if (file.size > MAX_RESUME_BYTES) return 'Resume must be under 5 MB.'
  if (!ACCEPTED_RESUME_TYPES.includes(file.type) && !/\.(pdf|docx)$/i.test(file.name))
    return 'Resume must be a PDF or DOCX file.'
  return ''
}

/** Consent checkbox is required. */
export function validateConsent(checked: boolean): string {
  return checked ? '' : 'You must consent to data processing to apply.'
}
