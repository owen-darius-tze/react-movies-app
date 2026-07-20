// Application reference data for the job application form.

/** Roles currently open for applications. The selects/validator reference this. */
export const OPEN_ROLES = [
  'Frontend Engineer (React)',
  'Backend Engineer (Node)',
  'Full-Stack Engineer',
  'AI/ML Engineer',
  'Data Analyst',
  'Product Designer',
  'Engineering Manager',
] as const

export type OpenRole = (typeof OPEN_ROLES)[number]
