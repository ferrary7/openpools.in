// Utility functions for dynamic pronouns in DNA profiles

/**
 * Get the appropriate pronoun based on ownership
 * @param {boolean} isOwnDNA - Whether viewing own DNA
 * @param {string} possessive - If true, returns possessive form (your/their)
 * @returns {string} - The appropriate pronoun
 */
export function getPronoun(isOwnDNA, possessive = true) {
  if (possessive) {
    return isOwnDNA ? 'your' : 'their'
  }
  return isOwnDNA ? 'You' : 'They'
}

/**
 * Get possessive form with name option
 * @param {boolean} isOwnDNA - Whether viewing own DNA
 * @param {string} name - User's first name
 * @returns {string} - "Your" or "Name's" or "Their"
 */
export function getPossessiveName(isOwnDNA, name = null) {
  if (isOwnDNA) return 'Your'
  if (name) {
    const firstName = name.split(' ')[0]
    return `${firstName}'s`
  }
  return 'Their'
}

/**
 * Get subject pronoun (you/they)
 * @param {boolean} isOwnDNA - Whether viewing own DNA
 * @returns {string} - "you" or "they"
 */
export function getSubjectPronoun(isOwnDNA) {
  return isOwnDNA ? 'you' : 'they'
}

/**
 * Conjugate verb based on pronoun
 * @param {boolean} isOwnDNA - Whether viewing own DNA
 * @param {string} youForm - Verb form for "you" (e.g., "are", "have")
 * @param {string} theyForm - Verb form for "they" (e.g., "are", "has")
 * @returns {string} - Appropriate verb form
 */
export function conjugateVerb(isOwnDNA, youForm, theyForm) {
  return isOwnDNA ? youForm : theyForm
}
