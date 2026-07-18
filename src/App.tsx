import { useMemo, useState } from 'react'
import './App.css'
import { COUNTRY_CODES } from './lib/countryCodes'
import {
  passwordStrength,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from './lib/validations'

interface FormState {
  name: string
  email: string
  countryCode: string
  phone: string
  password: string
  confirmPassword: string
  agreed: boolean
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  countryCode: COUNTRY_CODES[0].dial,
  phone: '',
  password: '',
  confirmPassword: '',
  agreed: false,
}

export default function App() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  )
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>(
    {},
  )
  const [submitted, setSubmitted] = useState(false)
  const [done, setDone] = useState(false)

  const strength = useMemo(() => passwordStrength(form.password), [form.password])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateField(key: keyof FormState): string {
    switch (key) {
      case 'name':
        return validateName(form.name)
      case 'email':
        return validateEmail(form.email)
      case 'phone':
        return validatePhone(form.phone)
      case 'password':
        return validatePassword(form.password)
      case 'confirmPassword':
        return validateConfirmPassword(form.confirmPassword, form.password)
      case 'agreed':
        return form.agreed ? '' : 'You must accept the terms to continue.'
      default:
        return ''
    }
  }

  function validateAll(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    const fields: (keyof FormState)[] = [
      'name',
      'email',
      'phone',
      'password',
      'confirmPassword',
      'agreed',
    ]
    fields.forEach((f) => {
      const err = validateField(f)
      if (err) next[f] = err
    })
    setErrors(next)
    setTouched(
      fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}),
    )
    return Object.keys(next).length === 0
  }

  function handleBlur(key: keyof FormState) {
    setTouched((prev) => ({ ...prev, [key]: true }))
    setErrors((prev) => ({ ...prev, [key]: validateField(key) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (validateAll()) {
      setDone(true)
    }
  }

  function showError(key: keyof FormState): string | undefined {
    return touched[key] || submitted ? errors[key] : undefined
  }

  const strengthClass =
    strength.level === 'strong'
      ? 'strength-strong'
      : strength.level === 'fair'
        ? 'strength-fair'
        : 'strength-weak'

  const strengthWidth =
    strength.level === 'strong'
      ? '100%'
      : strength.level === 'fair'
        ? '66%'
        : strength.level === 'weak' && strength.score > 0
          ? '33%'
          : '0%'

  if (done) {
    return (
      <main className="page">
        <div className="card">
          <div className="alert alert-success">
            ✓ Registration successful. Welcome, {form.name.trim()}!
          </div>
          <h1 className="title">You're all set</h1>
          <p className="subtitle">
            A confirmation email has been sent to <strong>{form.email}</strong>.
          </p>
          <button className="submit" onClick={() => { setDone(false); setForm(INITIAL_FORM); setTouched({}); setErrors({}); setSubmitted(false); }}>
            Register another account
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="card">
        <h1 className="title">Create your account</h1>
        <p className="subtitle">It only takes a minute.</p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              autoComplete="name"
              aria-invalid={!!showError('name')}
              onChange={(e) => update('name', e.target.value)}
              onBlur={() => handleBlur('name')}
            />
            {showError('name') && <p className="field-error">{showError('name')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              autoComplete="email"
              aria-invalid={!!showError('email')}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => handleBlur('email')}
            />
            {showError('email') && <p className="field-error">{showError('email')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="phone">Phone</label>
            <div className="phone-row">
              <select
                id="countryCode"
                value={form.countryCode}
                onChange={(e) => update('countryCode', e.target.value)}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={`${c.label}-${c.dial}`} value={c.dial}>
                    {c.label} ({c.dial})
                  </option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                autoComplete="tel"
                aria-invalid={!!showError('phone')}
                placeholder="e.g. 555 123 4567"
                onChange={(e) => update('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
              />
            </div>
            {showError('phone') && <p className="field-error">{showError('phone')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              autoComplete="new-password"
              aria-invalid={!!showError('password')}
              onChange={(e) => update('password', e.target.value)}
              onBlur={() => handleBlur('password')}
            />
            {form.password && (
              <div className={`strength ${strengthClass}`}>
                <span className="strength-bar">
                  <span className="strength-bar-fill" style={{ width: strengthWidth }} />
                </span>
                <span className="strength-text">{strength.level}</span>
              </div>
            )}
            {showError('password') && <p className="field-error">{showError('password')}</p>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              autoComplete="new-password"
              aria-invalid={!!showError('confirmPassword')}
              onChange={(e) => update('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
            />
            {showError('confirmPassword') && (
              <p className="field-error">{showError('confirmPassword')}</p>
            )}
          </div>

          <div className="field">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => update('agreed', e.target.value === 'true')}
                onBlur={() => handleBlur('agreed')}
              />
              I agree to the terms and privacy policy.
            </label>
            {showError('agreed') && <p className="field-error">{showError('agreed')}</p>}
          </div>

          <button className="submit" type="submit">Create account</button>
        </form>
      </div>
    </main>
  )
}
