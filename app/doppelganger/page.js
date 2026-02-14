import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveEvent, getUserTeam } from '@/lib/doppelganger'
import { EventCard } from '@/components/doppelganger'
import Link from 'next/link'

export const metadata = {
  title: 'Doppelganger Sprint | OpenPools',
  description: 'Find your signal twin and build something amazing in 30 hours'
}

export default async function DoppelgangerPage() {
  const supabase = await createClient()
  const serviceClient = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use service client to fetch event (bypasses RLS for public access)
  const event = await getActiveEvent(serviceClient)

  // Redirect to home if no active event
  if (!event) {
    redirect('/')
  }

  // Redirect to leaderboard if event is completed (results announced)
  if (event.status === 'completed') {
    redirect('/doppelganger/leaderboard')
  }

  // Get user's team if logged in
  const userTeam = user ? await getUserTeam(supabase, user.id, event.id) : null

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-purple-400 text-sm font-bold mb-8 animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              30-HOUR BUILD CHALLENGE
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter animate-fadeInUp">
              DOPPEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">GANGER</span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              The ultimate skill-resonance challenge. 30 hours. One AI-generated mission.
              Find Your People, Build What Matters.
            </p>

            {/* Path visualization */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl mt-8">
              {[
                { step: '01', title: 'FORM SQUAD', desc: 'Sync with 2-4 builders', color: 'from-purple-500 to-indigo-500' },
                { step: '02', title: 'VALIDATE', desc: 'Extract skill resonance', color: 'from-indigo-500 to-blue-500' },
                { step: '03', title: 'TRANSMIT', desc: 'Get your AI challenge', color: 'from-blue-500 to-pink-500' },
                { step: '04', title: 'DEPLOY', desc: 'Build & rule the board', color: 'from-pink-500 to-orange-500' }
              ].map((item, i) => (
                <div key={item.step}
                  className="glass-dark rounded-3xl p-5 border border-white/5 relative group hover:border-white/20 transition-all duration-500 animate-fadeInUp"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-white font-black text-[10px] mb-4 shadow-lg`}>
                    {item.step}
                  </div>
                  <h3 className="text-white font-black mb-2 tracking-widest uppercase text-xs italic">{item.title}</h3>
                  <p className="text-gray-500 text-[10px] font-bold leading-relaxed uppercase tracking-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Event Card */}
          <div className="lg:col-span-8 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <EventCard event={event} userTeam={userTeam} isLoggedIn={!!user} />
          </div>

          {/* Intel Sidebar */}
          <div className="lg:col-span-4 space-y-6 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
            {/* Login CTA for non-logged in users */}
            {!user && (
              <div className="glass-dark rounded-[2.5rem] p-8 border border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Ready to compete?</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Sign in to create your team and join the challenge.
                  </p>
                  <Link href="/login?redirect=/doppelganger">
                    <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:from-purple-600 hover:to-pink-600 transition-all">
                      Sign In to Participate
                    </button>
                  </Link>
                  <p className="text-center text-gray-500 text-xs mt-4">
                    Don't have an account?{' '}
                    <Link href="/signup?redirect=/doppelganger" className="text-purple-400 hover:text-purple-300">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Scoring Intel */}
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20">
                  <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Scoring Protocol</h3>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Signal Synergy', weight: '25%', color: 'from-purple-500/40 to-indigo-500/40' },
                  { label: 'Consistency', weight: '20%', color: 'from-pink-500/40 to-orange-500/40' },
                  { label: 'Technical Execution', weight: '35%', color: 'from-blue-500/40 to-cyan-500/40' },
                  { label: 'Social Proof', weight: '20%', color: 'from-green-500/40 to-emerald-500/40' }
                ].map((item) => (
                  <div key={item.label} className="group cursor-default">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                      <span className="text-xs font-black text-gray-500">{item.weight}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color} w-0 group-hover:w-full transition-all duration-1000 ease-out`} style={{ width: item.weight }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard CTA */}
            <Link href="/doppelganger/leaderboard" className="block group">
              <div className="glass-dark rounded-[2rem] p-6 border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all text-purple-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">HALL OF FAME</h4>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">View Live Rankings</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
