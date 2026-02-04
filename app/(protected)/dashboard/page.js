import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import KeywordDrawer from '@/components/dashboard/KeywordDrawer'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Refresh insights silently on page load */}
      <InsightsRefresher
        userId={user.id}
        keywords={keywordProfile?.keywords}
        signalClassification={keywordProfile?.signal_classification}
        complementarySkills={keywordProfile?.complementary_skills}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'there'}!
          </h1>
          <p className="text-lg text-gray-600">
            Your professional command center
          </p>
        </div>

        {/* 3-Column Cockpit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SIDEBAR - Identity & Stats - Desktop Only */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{profile?.full_name || 'User'}</h3>
                <p className="text-sm text-gray-500 mb-3">@{profile?.username || user.id.slice(0, 8)}</p>
                <div className="mb-4">
                  <PremiumBadge
                    isPremium={profile?.is_premium}
                    premiumSource={profile?.premium_source}
                    expiresAt={profile?.premium_expires_at}
                    size="md"
                  />
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <Link href="/profile" className="mt-6 w-full block text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition-colors">
                Edit Profile
              </Link>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 mb-6">Quick Stats</h3>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Signals</span>
                <span className="text-2xl font-bold text-primary-600">{keywordProfile?.total_keywords || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Matches</span>
                <span className="text-2xl font-bold text-primary-600"><MatchesCount initialCount={matchesCount || 0} /></span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Network</span>
                <span className="text-2xl font-bold text-primary-600">{collabsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Journal</span>
                <span className="text-2xl font-bold text-primary-600">{journalsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* MAIN COLUMN(S) - Spans 9 columns on desktop */}
          <div className="lg:col-span-9 space-y-8 order-1 lg:order-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* CENTER PANEL (Main Features) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Antenna */}
                  <Link href="/ask-antenna" className="group block">
                    <div className="relative overflow-hidden rounded-2xl bg-[#1e1e1e] p-6 hover:shadow-2xl hover:shadow-pink-500/30 shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-800 hover:border-pink-500/50">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-primary-500/10 rounded-full blur-3xl"></div>
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-primary-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-primary-500 flex items-center justify-center shadow-lg shadow-pink-500/50">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a .375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white"><span className="text-pink-400">A</span>ntenna</h2>
                            <p className="text-gray-400 text-xs">AI-powered search</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">Find collaborators using natural language</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-primary-500 text-white rounded-xl text-sm font-semibold group-hover:from-pink-600 group-hover:to-primary-600 transition-colors shadow-lg shadow-pink-500/30">
                          Search Now
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* DNA */}
                  <Link href={`/dna/${profile?.username || user.id}`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl bg-[#1e1e1e] p-6 hover:shadow-2xl hover:shadow-pink-500/30 shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-800 hover:border-pink-500/50">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-500/30 to-purple-500/20 rounded-full blur-3xl"></div>
                      </div>
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/50">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-white"><span className="text-gray-300">Professional </span><span className="text-pink-400">DNA</span></h2>
                            <p className="text-gray-400 text-xs">Your profile</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">Your verified professional identity</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-semibold group-hover:from-pink-600 group-hover:to-purple-700 transition-all shadow-lg shadow-pink-500/30">
                          View DNA
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* MOBILE STATS - Only on mobile, forced below Hero Cards */}
                <div className="lg:hidden grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Signals</p>
                    <p className="text-xl font-bold text-primary-600">{keywordProfile?.total_keywords || 0}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Matches</p>
                    <p className="text-xl font-bold text-primary-600"><MatchesCount initialCount={matchesCount || 0} /></p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Network</p>
                    <p className="text-xl font-bold text-primary-600">{collabsCount || 0}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Journal</p>
                    <p className="text-xl font-bold text-primary-600">{journalsCount || 0}</p>
                  </div>
                </div>

                {/* Signal Profile */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Your Signal Profile</h2>
                      <p className="text-gray-600 text-sm mt-1">Skills that define you</p>
                    </div>
                    <Link href="/profile" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">Edit →</Link>
                  </div>
                  {keywordProfile?.keywords ? (
                    <>
                      <KeywordDrawer keywords={keywordProfile.keywords} />
                      <div className="flex justify-end mt-6">
                        <a href="/profile#add-pdf-signals" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">Update Signals →</a>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-6">You haven't created your keyword profile yet</p>
                      <Link href="/onboarding" className="px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors inline-block">Complete Onboarding</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL (Action Cards) */}
              <div className="lg:col-span-1 space-y-6">
                <Link href="/matches" className="group block">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Find Matches</h3>
                        <p className="text-xs text-gray-600">Meet people who vibe with your skills</p>
                      </div>
                    </div>
                    <div className="text-primary-600 font-semibold text-sm">Explore →</div>
                  </div>
                </Link>

                <Link href="/collaborators" className="group block">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Collaborators</h3>
                        <p className="text-xs text-gray-600">Chat with active collaborators</p>
                      </div>
                    </div>
                    <div className="text-blue-600 font-semibold text-sm">View →</div>
                  </div>
                </Link>

                <Link href="/journal?tab=journal" className="group block">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Journal</h3>
                        <p className="text-xs text-gray-600">Document your professional growth</p>
                      </div>
                    </div>
                    <div className="text-purple-600 font-semibold text-sm">Write Entry →</div>
                  </div>
                </Link>

                <Link href="/journal?tab=showcase" className="group block">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Showcase</h3>
                        <p className="text-xs text-gray-600">Feature your best work</p>
                      </div>
                    </div>
                    <div className="text-green-600 font-semibold text-sm">View Showcase →</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Trusted By - Below everything in the main content area */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <CompaniesSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
