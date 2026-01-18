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

    // Get all unique companies from profiles table, ordered alphabetically
    const { data: companies, error } = await supabase
      .from('profiles')
      .select('company')
      .not('company', 'is', null)
      .order('company', { ascending: true })

    if (error) {
      console.error('Error fetching companies:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Remove duplicates and filter empty strings, normalize to title case
    const uniqueCompanies = Array.from(
      new Set(
        (companies || [])
          .map(c => c.company?.trim())
          .filter(c => c && c.length > 0)
          .map(c => normalizeCompanyName(c))
      )
    ).sort()

    return Response.json({ companies: uniqueCompanies })
  } catch (error) {
    console.error('Unexpected error:', error)
    return Response.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
