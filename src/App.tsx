import { useState } from 'react'
import './App.css'
import { OPEN_ROLES } from './lib/positions'
import {
  AVAILABILITY_OPTIONS,
  COVER_LETTER_MIN,
  validateAvailability,
  validateConsent,
  validateCoverLetter,
  validateEmail,
  validateFullName,
  validatePhoneOptional,
  validatePosition,
  validateResume,
  validateUrl,
  validateYears,
} from './lib/validations'

interface FormState {
  fullName: string
  email: string
  phone: string
  position: string
  years: string
  url: string
  coverLetter: string
  availability: string
  consent: boolean
}

const INITIAL_FORM: FormState = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  years: '',
  url: '',
  coverLetter: '',
  availability: '',
  consent: false,
}

type Fields = keyof FormState

export default function App() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [resume, setResume] = useState<File | null>(null)
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({})
  const [resumeError, setResumeError] = useState('')
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [done, setDone] = useState(false)

  function update<K extends Fields>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateField(key: Fields): string {
    switch (key) {
      case 'fullName': return validateFullName(form.fullName)
      case 'email': return validateEmail(form.email)
      case 'phone': return validatePhoneOptional(form.phone)
      case 'position': return validatePosition(form.position, OPEN_ROLES)
      case 'years': return validateYears(form.years)
      case 'url': return validateUrl(form.url)
      case 'coverLetter': return validateCoverLetter(form.coverLetter)
      case 'availability': return validateAvailability(form.availability)
      case 'consent': return validateConsent(form.consent)
      default: return ''
    }
  }

  function validateAll(): boolean {
    const next: Partial<Record<Fields, string>> = {}
    const fields: Fields[] = [
      'fullName', 'email', 'phone', 'position', 'years', 'url',
      'coverLetter', 'availability', 'consent',
    ]
    fields.forEach((f) => {
      const err = validateField(f)
      if (err) next[f] = err
    })
    const rErr = validateResume(resume)
    setResumeError(rErr)

    setErrors(next)
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}))
    return Object.values(next).every((v) => !v) && !rErr
  }

  function handleBlur(key: Fields) {
    setTouched((prev) => ({ ...prev, [key]: true }))
    setErrors((prev) => ({ ...prev, [key]: validateField(key) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (validateAll()) setDone(true)
  }

  function showError(key: Fields): string | undefined {
    return touched[key] || submitted ? errors[key] : undefined
  }

  function reset() {
    setForm(INITIAL_FORM)
    setResume(null)
    setTouched({})
    setErrors({})
    setResumeError('')
    setSubmitted(false)
    setDone(false)
  }

  if (done) {
    return (
      <main className="page">
        <div className="card">
          <div className="alert alert-success">
            ✓ Application received. Thank you, {form.fullName.trim()}!
          </div>
          <h1 className="title">We'll be in touch</h1>
          <p className="subtitle">
            You applied for <strong>{form.position}</strong>. A confirmation has been
            sent to <strong>{form.email}</strong>.
          </p>
          <button className="submit" onClick={reset}>Submit another application</button>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="card">
        <h1 className="title">Apply to Flyrank</h1>
        <p className="subtitle">Fields marked with * are required.</p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="fullName">Full name *</label>
            <input id="fullName" type="text" value={form.fullName} autoComplete="name"
              aria-invalid={!!showError('fullName')}
              onChange={(e) => update('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')} />
            {showError('fullName') && <p className="field-error">{showError('fullName')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">Email *</label>
            <input id="email" type="email" value={form.email} autoComplete="email"
              aria-invalid={!!showError('email')}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => handleBlur('email')} />
            {showError('email') && <p className="field-error">{showError('email')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="phone">Phone (optional)</label>
            <input id="phone" type="tel" value={form.phone} autoComplete="tel"
              placeholder="e.g. +1 555 123 4567"
              aria-invalid={!!showError('phone')}
              onChange={(e) => update('phone', e.target.value)}
              onBlur={() => handleBlur('phone')} />
            {showError('phone') && <p className="field-error">{showError('phone')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="position">Role you're applying for *</label>
            <select id="position" value={form.position}
              aria-invalid={!!showError('position')}
              onChange={(e) => update('position', e.target.value)}
              onBlur={() => handleBlur('position')}>
              <option value="" disabled>Select a role…</option>
              {OPEN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {showError('position') && <p className="field-error">{showError('position')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="years">Years of relevant experience *</label>
            <input id="years" type="number" min={0} max={60} step={1} value={form.years}
              placeholder="e.g. 3"
              aria-invalid={!!showError('years')}
              onChange={(e) => update('years', e.target.value)}
              onBlur={() => handleBlur('years')} />
            {showError('years') && <p className="field-error">{showError('years')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="url">Portfolio / LinkedIn URL (optional)</label>
            <input id="url" type="url" value={form.url} placeholder="https://…"
              aria-invalid={!!showError('url')}
              onChange={(e) => update('url', e.target.value)}
              onBlur={() => handleBlur('url')} />
            {showError('url') && <p className="field-error">{showError('url')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="resume">Resume (PDF or DOCX, under 5 MB) *</label>
            <input id="resume" type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              aria-invalid={!!(submitted && resumeError)}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setResume(f)
                setResumeError(validateResume(f))
              }} />
            {resume && <p className="file-name">{resume.name} ({Math.round(resume.size / 1024)} KB)</p>}
            {(submitted ? resumeError : '') && <p className="field-error">{resumeError}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="coverLetter">
              Cover letter * <span className="muted">(min {COVER_LETTER_MIN} chars; {form.coverLetter.length} so far)</span>
            </label>
            <textarea id="coverLetter" rows={6} value={form.coverLetter}
              aria-invalid={!!showError('coverLetter')}
              onChange={(e) => update('coverLetter', e.target.value)}
              onBlur={() => handleBlur('coverLetter')} />
            {showError('coverLetter') && <p className="field-error">{showError('coverLetter')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="availability">When can you start? *</label>
            <select id="availability" value={form.availability}
              aria-invalid={!!showError('availability')}
              onChange={(e) => update('availability', e.target.value)}
              onBlur={() => handleBlur('availability')}>
              <option value="" disabled>Select…</option>
              {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {showError('availability') && <p className="field-error">{showError('availability')}</p>}
          </div>

          <div className="field">
            <label className="checkbox">
              <input type="checkbox" checked={form.consent}
                onChange={(e) => update('consent', e.target.checked)}
                onBlur={() => handleBlur('consent')} />
              I consent to Flyrank processing my application data for this role.
            </label>
            {showError('consent') && <p className="field-error">{showError('consent')}</p>}
          </div>

          <button className="submit" type="submit">Submit application</button>
        </form>
      </div>
    </main>
  )
}
