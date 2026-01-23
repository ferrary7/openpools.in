import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Normalize company name to title case
function normalizeCompanyName(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The setAll method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Get companies from profiles table
    const { data: profileCompanies, error: profileError } = await supabase
      .from('profiles')
      .select('company')
      .not('company', 'is', null)

    if (profileError) {
      console.error('Error fetching profile companies:', profileError)
      return Response.json({ error: profileError.message }, { status: 500 })
    }

    // Get companies from keyword_profiles (work history companies)
    const { data: keywordProfiles, error: keywordError } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .not('keywords', 'is', null)

    if (keywordError) {
      console.error('Error fetching keyword companies:', keywordError)
      // Don't fail, just log and continue with profile companies only
    }

    // Extract company names from keywords (keywords with source: 'work_history' or 'company')
    const companyKeywords = []
    if (keywordProfiles) {
      keywordProfiles.forEach(profile => {
        if (Array.isArray(profile.keywords)) {
          profile.keywords.forEach(kw => {
            // Check if keyword is a company (has source indicating work history or is tagged as company)
            if (kw.source === 'work_history' || kw.source === 'company' || kw.source === 'resume') {
              // Company keywords are usually capitalized and multi-word
              if (kw.keyword && kw.keyword.length > 2 && /^[A-Z]/.test(kw.keyword)) {
                companyKeywords.push(kw.keyword)
              }
            }
          })
        }
      })
    }

    // Combine both sources
    const allCompanies = [
      ...(profileCompanies || []).map(c => c.company),
      ...companyKeywords
    ]

    // Remove duplicates and filter empty strings, normalize to title case
    const invalidValues = ['.', 'na', 'no', 'nan', 'no experience', 'none', 'n/a', 'unemployed', 'student', 'freelancer', 'self-employed']
    const uniqueCompanies = Array.from(
      new Set(
        allCompanies
          .map(c => c?.trim())
          .filter(c => c && c.length > 0 && !invalidValues.includes(c.toLowerCase()))
          .map(c => normalizeCompanyName(c))
      )
    ).sort()

    return Response.json({ companies: uniqueCompanies })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
