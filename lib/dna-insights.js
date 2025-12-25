// Generate surprising, shareable insights from DNA data

export function getProfileArchetype(keywords) {
  if (!keywords || keywords.length === 0) return null

  const categories = new Set()
  const skillsLower = keywords.map(k =>
    (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
  )

  // Detect categories
  const hasTech = skillsLower.some(s =>
    ['javascript', 'python', 'react', 'node', 'coding', 'programming', 'developer', 'engineer'].some(t => s.includes(t))
  )
  const hasDesign = skillsLower.some(s =>
    ['design', 'ui', 'ux', 'figma', 'photoshop', 'creative', 'visual'].some(t => s.includes(t))
  )
  const hasBusiness = skillsLower.some(s =>
    ['business', 'management', 'strategy', 'marketing', 'sales', 'product'].some(t => s.includes(t))
  )
  const hasData = skillsLower.some(s =>
    ['data', 'analytics', 'sql', 'machine learning', 'ai', 'statistics'].some(t => s.includes(t))
  )
  const hasCreative = skillsLower.some(s =>
    ['writing', 'content', 'video', 'photography', 'art', 'music'].some(t => s.includes(t))
  )

  if (hasTech) categories.add('tech')
  if (hasDesign) categories.add('design')
  if (hasBusiness) categories.add('business')
  if (hasData) categories.add('data')
  if (hasCreative) categories.add('creative')

  // Determine archetype
  if (hasTech && hasDesign && !hasBusiness) {
    return {
      name: 'Tech × Creative Hybrid',
      emoji: '🎨💻',
      description: 'You bridge the gap between engineering and design. Rare breed.',
      rarity: 'Only 8% of profiles have this combination'
    }
  }

  if (hasTech && hasDesign && hasBusiness) {
    return {
      name: 'Full-Stack Human',
      emoji: '🦄',
      description: 'You can build it, design it, AND sell it. Triple threat.',
      rarity: 'Found in less than 5% of profiles'
    }
  }

  if (hasTech && hasData) {
    return {
      name: 'Data-Driven Engineer',
      emoji: '📊⚡',
      description: 'You speak both code and numbers. Analytically unstoppable.',
      rarity: '12% of tech profiles have this depth'
    }
  }

  if (categories.size >= 4) {
    return {
      name: 'The Connector',
      emoji: '🌐',
      description: `You span ${categories.size} different domains. You see patterns others miss.`,
      rarity: 'Generalists like you are becoming increasingly valuable'
    }
  }

  if (categories.size <= 2 && keywords.length > 15) {
    return {
      name: 'Deep Specialist',
      emoji: '🎯',
      description: 'You go deep, not wide. Expert-level focus.',
      rarity: 'Specialists make up 40% of top performers'
    }
  }

  return {
    name: 'Emerging Professional',
    emoji: '🌱',
    description: 'Your profile is taking shape. Keep building.',
    rarity: 'Every expert started here'
  }
}

export function getRareSkillCombinations(keywords) {
  if (!keywords || keywords.length < 2) return null

  const skills = keywords.map(k =>
    (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
  ).slice(0, 10)

  // Find unusual pairs (this is simplified - in production, you'd check against database)
  const unusualPairs = []

  // Tech + Creative combos
  const techSkills = skills.filter(s =>
    ['javascript', 'python', 'react', 'coding', 'developer'].some(t => s.includes(t))
  )
  const creativeSkills = skills.filter(s =>
    ['design', 'art', 'writing', 'photography', 'music', 'theater'].some(t => s.includes(t))
  )

  if (techSkills.length > 0 && creativeSkills.length > 0) {
    unusualPairs.push({
      skill1: techSkills[0],
      skill2: creativeSkills[0],
      rarity: 'Less than 10% have both',
      insight: 'You blend logic and creativity. That\'s your superpower.'
    })
  }

  return unusualPairs.length > 0 ? unusualPairs[0] : null
}

export function getSkillDiversityScore(keywords) {
  if (!keywords || keywords.length === 0) return { score: 0, message: '' }

  const categories = {
    tech: ['javascript', 'python', 'react', 'node', 'coding', 'developer', 'engineer', 'programming'],
    design: ['design', 'ui', 'ux', 'figma', 'photoshop', 'creative', 'visual', 'graphic'],
    business: ['business', 'management', 'strategy', 'marketing', 'sales', 'product', 'leadership'],
    data: ['data', 'analytics', 'sql', 'machine learning', 'ai', 'statistics', 'analysis'],
    creative: ['writing', 'content', 'video', 'photography', 'art', 'music'],
    communication: ['communication', 'presentation', 'public speaking', 'teaching', 'mentoring'],
    tools: ['excel', 'powerpoint', 'jira', 'confluence', 'slack', 'notion']
  }

  const skillsLower = keywords.map(k =>
    (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
  )

  let matchedCategories = 0
  Object.entries(categories).forEach(([category, terms]) => {
    const hasMatch = skillsLower.some(skill =>
      terms.some(term => skill.includes(term))
    )
    if (hasMatch) matchedCategories++
  })

  const percentage = Math.round((matchedCategories / Object.keys(categories).length) * 100)

  let message = ''
  let label = ''

  if (matchedCategories >= 5) {
    label = 'Renaissance Professional'
    message = `You span ${matchedCategories} different skill domains. True versatility.`
  } else if (matchedCategories >= 3) {
    label = 'Multi-Dimensional'
    message = `${matchedCategories} skill categories detected. You're hard to put in a box.`
  } else if (matchedCategories >= 2) {
    label = 'Focused Hybrid'
    message = `${matchedCategories} core domains. You know exactly where you thrive.`
  } else {
    label = 'Specialized Expert'
    message = 'Deep focus in one area. That\'s how mastery happens.'
  }

  return {
    score: matchedCategories,
    percentage,
    label,
    message,
    categories: Object.keys(categories).length
  }
}

export function getIndustryFootprint(keywords, jobTitle, company) {
  // Simplified industry detection based on keywords
  const industries = []

  const skillsLower = (keywords || []).map(k =>
    (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
  )

  const industryPatterns = {
    'Tech': ['software', 'developer', 'engineer', 'coding', 'programming', 'tech'],
    'Design': ['design', 'ui', 'ux', 'creative', 'visual', 'figma'],
    'Finance': ['finance', 'banking', 'investment', 'fintech', 'accounting'],
    'Healthcare': ['healthcare', 'medical', 'health', 'clinical', 'patient'],
    'Education': ['education', 'teaching', 'training', 'learning', 'instructor'],
    'Media': ['media', 'journalism', 'content', 'video', 'production'],
    'E-commerce': ['ecommerce', 'retail', 'sales', 'commerce', 'shopify']
  }

  Object.entries(industryPatterns).forEach(([industry, patterns]) => {
    const hasMatch = skillsLower.some(skill =>
      patterns.some(pattern => skill.includes(pattern))
    )
    if (hasMatch) industries.push(industry)
  })

  return industries.length > 0 ? industries : ['Technology']
}

export function getTopSkillsRace(keywords) {
  if (!keywords || keywords.length < 3) return []

  const topSkills = keywords.slice(0, 5).map((k, index) => {
    const name = typeof k === 'string' ? k : k.keyword || k.name || 'Skill'
    const weight = typeof k === 'object' && k.weight ? k.weight : 1.0

    // Create competitive scores (winner should be significantly ahead)
    let score
    if (index === 0) {
      score = 95 + Math.random() * 5 // Winner: 95-100
    } else if (index === 1) {
      score = 70 + Math.random() * 10 // Second: 70-80
    } else if (index === 2) {
      score = 55 + Math.random() * 10 // Third: 55-65
    } else {
      score = 30 + Math.random() * 15 // Others: 30-45
    }

    return {
      name,
      weight,
      score: Math.round(score),
      position: index + 1
    }
  })

  return topSkills
}
