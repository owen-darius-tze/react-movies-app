export interface CountryCode {
  /** ISO-ish label shown in the select, e.g. "US". */
  label: string
  /** Dialing code, with leading +, e.g. "+1". */
  dial: string
}

// A small, representative list of country calling codes for the phone selector.
// Extend as needed.
export const COUNTRY_CODES: CountryCode[] = [
  { label: 'US', dial: '+1' },
  { label: 'CA', dial: '+1' },
  { label: 'GB', dial: '+44' },
  { label: 'AU', dial: '+61' },
  { label: 'DE', dial: '+49' },
  { label: 'FR', dial: '+33' },
  { label: 'IN', dial: '+91' },
  { label: 'CN', dial: '+86' },
  { label: 'JP', dial: '+81' },
  { label: 'BR', dial: '+55' },
  { label: 'ZA', dial: '+27' },
  { label: 'NG', dial: '+234' },
]
