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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your professional matchmaking dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Keywords</div>
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
            Your Keyword Profile
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Find Matches
          </h3>
          <p className="text-gray-600 mb-4">
            Discover professionals with similar skill patterns
          </p>
          <Link href="/matches" className="btn-primary">
            View Matches
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Write Journal
          </h3>
          <p className="text-gray-600 mb-4">
            Document your professional journey and expand your profile
          </p>
          <Link href="/journal" className="btn-primary">
            Create Entry
          </Link>
        </div>
      </div>
    </div>
  )
}
