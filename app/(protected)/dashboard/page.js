import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'
import CompaniesSection from '@/components/ui/CompaniesSection'
import InsightsRefresher from '@/components/dashboard/InsightsRefresher'
import MatchesCount from '@/components/dashboard/MatchesCount'
import PremiumBadge from '@/components/ui/PremiumBadge'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get keyword profile
  const { data: keywordProfile } = await supabase
    .from('keyword_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get recent matches count
  const { count: matchesCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get journal entries count
  const { count: journalsCount } = await supabase
    .from('journals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get active collaborations count
  const { count: collabsCount } = await supabase
    .from('collaborations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

  // Get user's organizations
  const { data: orgMemberships } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id,
        name,
        slug,
        logo_url
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Refresh insights silently on page load */}
      <InsightsRefresher 
        userId={user.id} 
        keywords={keywordProfile?.keywords}
        signalClassification={keywordProfile?.signal_classification}
        complementarySkills={keywordProfile?.complementary_skills}
      />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'there'}!
          </h1>
          <PremiumBadge
            isPremium={profile?.is_premium}
            premiumSource={profile?.premium_source}
            expiresAt={profile?.premium_expires_at}
            size="lg"
          />
        </div>
        <p className="text-gray-600 mt-2">
          Your Skills, Your Vibe, Your Network - all in one place.
        </p>
      </div>

      {/* Premium & Organization Banners - Side by side if both exist */}
      {(() => {
        const isPremium = profile?.is_premium && (!profile?.premium_expires_at || new Date(profile.premium_expires_at) > new Date())
        const hasOrg = orgMemberships && orgMemberships.length > 0 && orgMemberships.length === 1
        const hasMultipleOrgs = orgMemberships && orgMemberships.length > 1

        // Multiple orgs get their own section below
        if (hasMultipleOrgs) {
          return (
            <>
              {/* Premium Banner - Full width when no single org */}
              {isPremium && (
                <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-[2px]">
                  <div className="relative rounded-2xl bg-gradient-to-r from-amber-950 via-orange-950 to-yellow-950 p-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full blur-3xl" />
                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border border-amber-500/30">
                          <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Premium Member
                            {profile?.premium_source === 'coding_gita' && (
                              <span className="text-sm font-medium text-amber-300">via Coding Gita</span>
                            )}
                          </h2>
                          <p className="text-amber-200/80 text-sm">
                            {profile?.premium_expires_at
                              ? `Valid until ${(() => { const d = new Date(profile.premium_expires_at); const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; })()}`
                              : 'Unlimited access to all premium features'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-amber-300 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Priority Matching
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-amber-300 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Badge
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Multiple Orgs Grid */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🏢</span>
                  Your Organizations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orgMemberships.map((membership) => (
                    <Link
                      key={membership.organizations.id}
                      href={`/org/${membership.organizations.slug}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all">
                        <div className="flex items-center gap-3">
                          {membership.organizations.logo_url ? (
                            <img
                              src={membership.organizations.logo_url}
                              alt={membership.organizations.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-lg">🏢</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{membership.organizations.name}</h3>
                            <p className="text-xs text-gray-500 capitalize">{membership.role}</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )
        }

        // Both premium and single org - side by side
        if (isPremium && hasOrg) {
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Premium Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-[2px] h-full">
                <div className="relative rounded-2xl bg-gradient-to-r from-amber-950 via-orange-950 to-yellow-950 p-6 h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full blur-3xl" />
                  <div className="relative flex flex-col justify-between h-full gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border border-amber-500/30 shrink-0">
                        <svg className="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                          Premium Member
                          {profile?.premium_source === 'coding_gita' && (
                            <span className="text-xs font-medium text-amber-300">via Coding Gita</span>
                          )}
                        </h2>
                        <p className="text-amber-200/80 text-sm mt-1">
                          {profile?.premium_expires_at
                            ? `Valid until ${(() => { const d = new Date(profile.premium_expires_at); const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; })()}`
                            : 'Unlimited access to all premium features'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-amber-300 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Priority Matching
                      </div>
                      <div className="flex items-center gap-2 text-amber-300 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Badge
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Banner */}
              <Link href={`/org/${orgMemberships[0].organizations.slug}`} className="block group h-full">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[2px] h-full">
                  <div className="relative rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 p-6 h-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl" />
                    <div className="relative flex flex-col justify-between h-full gap-4">
                      <div className="flex items-start gap-4">
                        {orgMemberships[0].organizations.logo_url ? (
                          <img
                            src={orgMemberships[0].organizations.logo_url}
                            alt={orgMemberships[0].organizations.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/20 shrink-0">
                            <span className="text-xl">🏢</span>
                          </div>
                        )}
                        <div>
                          <h2 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                            {orgMemberships[0].organizations.name}
                            <span className="text-xs font-medium text-blue-300 capitalize">({orgMemberships[0].role})</span>
                          </h2>
                          <p className="text-blue-200/80 text-sm mt-1">
                            Access your organization's talent search dashboard
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-medium group-hover:bg-white/20 transition-colors border border-white/20 w-fit">
                        Open Dashboard
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        }

        // Only premium - full width
        if (isPremium) {
          return (
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-[2px]">
              <div className="relative rounded-2xl bg-gradient-to-r from-amber-950 via-orange-950 to-yellow-950 p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full blur-3xl" />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border border-amber-500/30">
                      <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Premium Member
                        {profile?.premium_source === 'coding_gita' && (
                          <span className="text-sm font-medium text-amber-300">via Coding Gita</span>
                        )}
                      </h2>
                      <p className="text-amber-200/80 text-sm">
                        {profile?.premium_expires_at
                          ? `Your premium access is valid until ${(() => { const d = new Date(profile.premium_expires_at); const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; })()}`
                          : 'Enjoy unlimited access to all premium features'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-amber-300 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Priority Matching
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-amber-300 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Badge
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        // Only single org - full width
        if (hasOrg) {
          return (
            <div className="mb-8">
              <Link href={`/org/${orgMemberships[0].organizations.slug}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[2px]">
                  <div className="relative rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 p-6">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl" />
                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        {orgMemberships[0].organizations.logo_url ? (
                          <img
                            src={orgMemberships[0].organizations.logo_url}
                            alt={orgMemberships[0].organizations.name}
                            className="w-14 h-14 rounded-xl object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/20">
                            <span className="text-2xl">🏢</span>
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {orgMemberships[0].organizations.name}
                            <span className="text-sm font-medium text-blue-300 capitalize">({orgMemberships[0].role})</span>
                          </h2>
                          <p className="text-blue-200/80 text-sm">
                            Access your organization's talent search dashboard
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium group-hover:bg-white/20 transition-colors border border-white/20">
                        Open Dashboard
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        }

        return null
      })()}

      {/* Feature Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Antenna Feature Banner */}
        <Link href="/ask-antenna" className="block group">
          <div className="relative overflow-hidden rounded-2xl bg-[#1E1E1E] p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 h-full">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-primary-500/20 opacity-50" />

            {/* Floating keywords decoration */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-40">
              <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full">React</span>
              <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full hidden sm:inline">Python</span>
              <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full hidden xl:inline">AI</span>
            </div>

            <div className="relative flex flex-col justify-between h-full gap-4">
              <div className="flex items-start gap-4">
                {/* Antenna Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    <span className="text-primary-400">A</span>ntenna
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Find the perfect people using natural language. Just describe who you're looking for.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium group-hover:bg-primary-600 transition-colors w-fit">
                Ask Antenna
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* DNA Feature Banner */}
        <Link href={`/dna/${profile?.username || user.id}`} className="block group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E1E1E] via-[#2A1A2E] to-[#1E1E1E] p-6 sm:p-8 hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 border border-primary-500/20 h-full">
            {/* Animated DNA strand decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500 to-primary-500 rounded-full blur-3xl" />
            </div>

            {/* Floating DNA-themed keywords */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-30">
              <span className="px-2 py-1 text-xs bg-primary-500/40 text-primary-300 rounded-full">DNA</span>
              <span className="px-2 py-1 text-xs bg-purple-500/40 text-purple-300 rounded-full hidden sm:inline">Verified</span>
              <span className="px-2 py-1 text-xs bg-primary-500/40 text-primary-300 rounded-full hidden xl:inline">Unique</span>
            </div>

            <div className="relative flex flex-col justify-between h-full gap-4">
              <div className="flex items-start gap-4">
                {/* DNA Helix Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center shrink-0 border border-primary-500/30">
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">
                    <span className="text-white">Professional </span>
                    <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">DNA</span>
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Your verified skill profile visualized. Download & share your professional certificate.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium group-hover:from-primary-600 group-hover:to-purple-600 transition-all w-fit">
                View Your DNA
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Companies Section */}
      <div className="mb-8">
        <CompaniesSection />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Signals</div>
          <div className="text-3xl font-bold text-primary-600">
            {keywordProfile?.total_keywords || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Matches Found</div>
          <div className="text-3xl font-bold text-primary-600">
            <MatchesCount initialCount={matchesCount || 0} />
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Collaborators</div>
          <div className="text-3xl font-bold text-primary-600">
            {collabsCount || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Journal Entries</div>
          <div className="text-3xl font-bold text-primary-600">
            {journalsCount || 0}
          </div>
        </div>
      </div>

      {/* Keyword Profile */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Signal Profile
          </h2>
          <Link href="/profile" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Edit Profile →
          </Link>
        </div>
        {keywordProfile?.keywords ? (
          <>
            <KeywordDisplay keywords={keywordProfile.keywords} />
            <div className="flex justify-end mt-4">
              <a 
                href="/profile#add-pdf-signals"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Update Signals →
              </a>
            </div>
          </>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">
              You haven't created your keyword profile yet
            </p>
            <Link href="/onboarding" className="btn-primary">
              Complete Onboarding
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Find Matches
          </h3>
          <p className="text-gray-600 mb-4">
            Meet people who vibe with your skills and work style
          </p>
          <Link href="/matches" className="btn-primary">
            View Matches
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Collaborators
          </h3>
          <p className="text-gray-600 mb-4">
            Connect and chat with your active collaborators - keep the momentum going
          </p>
          <Link href="/collaborators" className="btn-primary">
            View Collaborators
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Growth Journal
          </h3>
          <p className="text-gray-600 mb-4">
            Document your progress, lessons learned, and professional milestones
          </p>
          <Link href="/journal?tab=journal" className="btn-primary">
            Write Entry
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Professional Showcase
          </h3>
          <p className="text-gray-600 mb-4">
            Feature your best work, projects, and achievements in one place
          </p>
          <Link href="/journal?tab=showcase" className="btn-primary">
            View Showcase
          </Link>
        </div>
      </div>
    </div>
  )
}
