// Form validation utilities for counterpools

export const DOMAINS = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Environment',
  'Social Impact',
  'Agriculture',
  'Other',
]

export const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateLinkedIn(url) {
  if (!url) return true // Optional field
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('linkedin.com')
  } catch {
    return false
  }
}

export function validateCounterPoolsForm(formData) {
  const errors = {}

  // Required fields
  if (!formData.fullName?.trim()) {
    errors.fullName = 'Name is required'
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format'
  }

  if (formData.linkedIn && !validateLinkedIn(formData.linkedIn)) {
    errors.linkedIn = 'Invalid LinkedIn URL'
  }

  if (!formData.problemTitle?.trim()) {
    errors.problemTitle = 'Problem title is required'
  } else if (formData.problemTitle.trim().length < 10) {
    errors.problemTitle = 'Problem title must be at least 10 characters'
  }

  if (!formData.domain) {
    errors.domain = 'Domain is required'
  } else if (!DOMAINS.includes(formData.domain)) {
    errors.domain = 'Invalid domain selected'
  }

  if (!formData.difficulty) {
    errors.difficulty = 'Difficulty is required'
  } else if (!DIFFICULTY.includes(formData.difficulty)) {
    errors.difficulty = 'Invalid difficulty selected'
  }

  if (!formData.description?.trim()) {
    errors.description = 'Description is required'
  } else if (formData.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters'
  }

  if (!formData.expectedOutcome?.trim()) {
    errors.expectedOutcome = 'Expected outcome is required'
  } else if (formData.expectedOutcome.trim().length < 20) {
    errors.expectedOutcome = 'Expected outcome must be at least 20 characters'
  }

  // Validate links if provided (optional field)
  if (formData.links?.trim()) {
    const links = formData.links.split('\n').map(l => l.trim()).filter(l => l)
    for (const link of links) {
      try {
        new URL(link)
      } catch {
        errors.links = 'All links must be valid URLs (one per line)'
        break
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function sanitizeFormData(formData) {
  return {
    fullName: formData.fullName?.trim() || '',
    email: formData.email?.trim().toLowerCase() || '',
    linkedIn: formData.linkedIn?.trim() || '',
    problemTitle: formData.problemTitle?.trim() || '',
    domain: formData.domain,
    difficulty: formData.difficulty,
    description: formData.description?.trim() || '',
    expectedOutcome: formData.expectedOutcome?.trim() || '',
    links: formData.links?.trim() || '',
    solutionAdoption: Boolean(formData.solutionAdoption),
    hiringInterest: Boolean(formData.hiringInterest),
  }
}
