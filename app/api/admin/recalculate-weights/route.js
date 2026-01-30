import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

// Category importance weights (same as gemini.js)
const categoryWeights = {
  skills: 1.0,
  technologies: 0.95,
  expertise: 0.9,
  tools: 0.85,
  methodologies: 0.8,
  domains: 0.8,
  projects: 0.7,
  roles: 0.65,
  certifications: 0.6,
  companies: 0.5,
  institutions: 0.45,
  links: 0.2
}

function recalculateWeight(keyword) {
  const category = keyword.category || 'skills'
  const source = keyword.source || 'pdf'

  // Category base weight
  const categoryWeight = categoryWeights[category] || 0.5

  // Source multiplier (pdf treated as resume)
  const sourceMultiplier = (source === 'resume' || source === 'pdf') ? 1.0
    : source === 'linkedin' ? 0.95
    : source === 'github' ? 0.9
    : 0.8

  // Calculate new weight
  return Math.round(categoryWeight * sourceMultiplier * 100) / 100
}

export async function POST(req) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all keyword profiles
    const { data: keywordProfiles, error: fetchError } = await serviceClient
      .from('keyword_profiles')
      .select('id, user_id, keywords')

    if (fetchError) {
      console.error('Error fetching keyword profiles:', fetchError)
      return Response.json({ error: fetchError.message }, { status: 500 })
    }

    let updatedCount = 0
    let errorCount = 0
    const errors = []

    // Process each profile
    for (const kp of keywordProfiles) {
      if (!kp.keywords || !Array.isArray(kp.keywords)) continue

      // Recalculate weights for all keywords
      const updatedKeywords = kp.keywords.map(kw => ({
        ...kw,
        weight: recalculateWeight(kw)
      }))

      // Update in database
      const { error: updateError } = await serviceClient
        .from('keyword_profiles')
        .update({
          keywords: updatedKeywords,
          last_updated: new Date().toISOString()
        })
        .eq('id', kp.id)

      if (updateError) {
        errorCount++
        errors.push({ user_id: kp.user_id, error: updateError.message })
      } else {
        updatedCount++
      }
    }

    return Response.json({
      success: true,
      message: `Recalculated weights for ${updatedCount} profiles`,
      totalProfiles: keywordProfiles.length,
      updatedCount,
      errorCount,
      errors: errors.slice(0, 10) // Only return first 10 errors
    })
  } catch (error) {
    console.error('Recalculate weights error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// GET to preview what will be changed
export async function GET(req) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get sample keyword profile
    const { data: sampleProfile, error } = await serviceClient
      .from('keyword_profiles')
      .select('id, user_id, keywords')
      .limit(1)
      .single()

    if (error || !sampleProfile) {
      return Response.json({ error: 'No keyword profiles found' }, { status: 404 })
    }

    // Show before/after for sample
    const sample = sampleProfile.keywords.slice(0, 10).map(kw => ({
      keyword: kw.keyword,
      category: kw.category,
      source: kw.source,
      oldWeight: kw.weight,
      newWeight: recalculateWeight(kw)
    }))

    // Get stats
    const { count } = await serviceClient
      .from('keyword_profiles')
      .select('*', { count: 'exact', head: true })

    return Response.json({
      totalProfiles: count,
      sampleChanges: sample,
      categoryWeights,
      message: 'POST to this endpoint to apply changes to all profiles'
    })
  } catch (error) {
    console.error('Preview error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
