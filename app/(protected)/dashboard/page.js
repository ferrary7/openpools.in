import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your Skills, Your Vibe, Your Network - all in one place.
        </p>
      </div>

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
        <Link href={`/dna/${user.id}`} className="block group">
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
            {matchesCount || 0}
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
          <KeywordDisplay keywords={keywordProfile.keywords} />
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
            Write Journal
          </h3>
          <p className="text-gray-600 mb-4">
            Drop your thoughts, wins, or ideas - let your profile evolve
          </p>
          <Link href="/journal" className="btn-primary">
            Create Entry
          </Link>
        </div>
      </div>
    </div>
  )
}
