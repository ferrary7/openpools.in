import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveEvent, getUserTeam } from '@/lib/doppelganger'
import { EventCard, EventPoller } from '@/components/doppelganger'
import PrizeCards from '@/components/doppelganger/PrizeCards'
import Link from 'next/link'

export const metadata = {
  title: 'Doppelganger Sprint | OpenPools',
  description: 'Find your signal twin and build something amazing in 30 hours'
}

export default async function DoppelgangerPage() {
  const supabase = await createClient()
  const serviceClient = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  const event = await getActiveEvent(serviceClient)

  if (!event) {
    redirect('/')
  }

  if (event.status === 'completed') {
    redirect('/doppelganger/leaderboard')
  }

  const userTeam = user ? await getUserTeam(supabase, user.id, event.id) : null

  const steps = [
    {
      num: '1',
      title: 'Assemble',
      desc: 'Gather 2–4 builders who share your signal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    {
      num: '2',
      title: 'Validate',
      desc: 'Verify your team and lock in your skills',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )
    },
    {
      num: '3',
      title: 'Get Challenged',
      desc: 'Receive an AI-crafted problem statement',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      )
    },
    {
      num: '4',
      title: 'Build & Ship',
      desc: '30 hours to prototype and deploy your idea',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      )
    }
  ]

  const scoringCategories = [
    { label: 'Signal Synergy', weight: 25, desc: 'How well skills align' },
    { label: 'Consistency', weight: 20, desc: 'Regular progress updates' },
    { label: 'Technical Execution', weight: 35, desc: 'Quality of the build' },
    { label: 'Social Proof', weight: 20, desc: 'Community engagement' }
  ]

  return (
    <div className="min-h-screen pt-12 pb-32">
      <EventPoller eventId={event.id} currentStatus={event.status} />
      <div className="max-w-7xl mx-auto px-6">
        {/* The Radical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(120px,auto)] gap-4">

          {/* Cell 1: Brand / Hero (8 cols) */}
          <div className="md:col-span-8 glass-dark rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden group border-white/5 shadow-2xl animate-fadeIn">
            <div className="absolute top-0 right-0 p-8">
              <div className="text-[12rem] font-black leading-none text-white/[0.03] select-none tracking-tighter">DG</div>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-12 shadow-[0_0_20px_rgba(232,68,153,0.4)]">
                  Live Sprint Challenge
                </div>

                <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-[0.85]">
                  DOPPEL<br />GANGER
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-400 max-w-xl leading-snug mb-4">
                  Match resonance.<br />
                  <span className="text-white">Build the signal.</span>
                </h2>

                <p className="text-lg text-gray-400 leading-relaxed font-light italic max-w-lg">
                  "Find your signal twin, receive an AI challenge, and deploy reality in 30 hours."
                </p>
              </div>

              <div className="mt-12 group/cta">
                <div className="flex items-center gap-4 text-primary-400 font-bold uppercase tracking-widest text-xs">
                  Explore the network
                  <div className="w-10 h-[2px] bg-primary-500/30 group-hover/cta:w-20 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cell 2: Timer & Prizes (4 cols) — sits in same row as Hero, matches its height */}
          <div className="md:col-span-4 glass-dark rounded-[2.5rem] p-10 border-primary-500/20 flex flex-col justify-between relative overflow-hidden shadow-2xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

            {/* 30H USP */}
            <div className="text-center">
              <div className="flex flex-col items-center">
                <span className="text-[11rem] font-black text-white tracking-tighter leading-none drop-shadow-[0_0_40px_rgba(232,68,153,0.5)]">30</span>
                <span className="text-xl font-black text-primary-500 tracking-[0.5em] -mt-2">HOURS</span>
              </div>
              <p className="text-sm text-gray-400 mt-4 font-medium">To build, ship & deploy</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">No sleep</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Real stakes</span>
                </div>
              </div>
            </div>

            <PrizeCards />
          </div>

          {/* Cell 3: Main Event Card (8 cols) */}
          <div className="md:col-span-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <EventCard
              event={event}
              userTeam={userTeam}
              isLoggedIn={!!user}
              isBentoView={true}
              steps={steps}
            />
          </div>

          {/* Cell 4: Timeline & Evaluation (4 cols) — sits next to Event Card */}
          <div className="md:col-span-4 glass-dark rounded-[2.5rem] p-8 border-white/5 flex flex-col shadow-2xl animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            {/* Timeline */}
            <div className="mb-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Timeline</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Registration</span>
                    <span className={`text-[9px] font-black ${event.status === 'registration' ? 'text-primary-400 animate-pulse' : 'text-gray-500'}`}>
                      {event.status === 'registration' ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-200">
                    {new Date(event.registration_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.registration_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">The Sprint</span>
                    <span className={`text-[9px] font-black ${event.status === 'active' ? 'text-primary-400 animate-pulse' : 'text-gray-500'}`}>
                      {event.status === 'registration' ? 'UPCOMING' : event.status === 'active' ? 'RUNNING' : 'CLOSED'}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-200">
                    {new Date(event.sprint_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.sprint_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation */}
            <div className="pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Evaluation</h4>
              <div className="space-y-3">
                {scoringCategories.slice(0, 3).map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{item.label}</span>
                      <span className="text-[9px] font-black text-primary-500">{item.weight}%</span>
                    </div>
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500" style={{ width: `${item.weight}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cell 6: Listings CTA (12 cols) */}
          <Link href="/doppelganger/leaderboard" className="md:col-span-12 group relative overflow-hidden rounded-[2.5rem] animate-fadeInUp h-[140px] border border-white/5 shadow-2xl" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-primary-600 transition-transform duration-1000 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-transparent"></div>
            <div className="relative h-full p-10 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143-1.954.317-2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0l.001.001h-.001m0 0a6.024 6.024 0 01-2.77-.853" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-white tracking-tighter leading-none mb-1">GLOBAL RANKINGS</h4>
                  <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Explore the high-signal leaderboard</p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
