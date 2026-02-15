'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import DNAHelixCanvas from '../dna/DNAHelixCanvas'
import { createClient } from '@/lib/supabase/client'

export default function HeroSection({ user, authLoading }) {
  const [scrollY, setScrollY] = useState(0)
  const [userProfile, setUserProfile] = useState(null)
  const [userDNA, setUserDNA] = useState(null)

  const supabase = createClient()

  // Fetch user profile and DNA data when user is available
  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return
    
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, profile_picture_url')
        .eq('id', user.id)
        .single()

      // Fetch user DNA/keywords
      const { data: keywordProfile } = await supabase
        .from('keyword_profiles')
        .select('keywords')
        .eq('user_id', user.id)
        .single()

      setUserProfile(profile)
      setUserDNA(keywordProfile)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#0f0f0f]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary-500 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-blue-500 opacity-10 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Animated Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 animate-fadeIn"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          AI-Powered Professional Matching
        </div>

        {/* Hero Title */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84499] to-pink-600">People.</span> <br />
          Build What <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84499] to-pink-600">Matters.</span>
        </h1>

        <p
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          Connect with peers and collaborators who share your exact skill DNA.
          The first professional network powered entirely by semantic resonance.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        >
          {authLoading ? (
            <div className="px-8 py-4 bg-white/10 text-transparent rounded-full font-medium w-40 animate-pulse">
              Loading
            </div>
          ) : user ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-medium transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(232,68,153,0.5)]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-black rounded-full font-medium transition-all hover:scale-105 hover:bg-gray-100"
            >
              Start for Free
            </Link>
          )}
          <a
            href="#how-it-works"
            className="px-8 py-4 glass text-white rounded-full font-medium transition-all hover:bg-white/20"
          >
            How it Works
          </a>
        </div>

        {/* Mobile Hero Visual: Holographic DNA (No Card) */}
        <div className="relative w-full h-[150px] md:hidden flex items-center justify-center -mt-12 pointer-events-none opacity-80">
          {/* Ambient Glows - "Holographic" Base */}
          <div className="absolute w-[160px] h-[160px] bg-primary-500/10 rounded-full blur-[50px] animate-pulse-slow"></div>

          {/* The Helix - Floating freely */}
          <div className="relative z-10 w-full h-full scale-100">
            <DNAHelixCanvas
              keywords={[
                { keyword: 'AI' }, { keyword: 'Match' }, { keyword: 'DNA' }
              ]}
              speed={0.3}
            />
          </div>
        </div>

        {/* Dashboard Preview / Floating Cards */}
        <div className="relative mx-auto max-w-5xl perspective-1000 hidden md:block group">
          <div
            className="relative rounded-xl border border-white/10 bg-[#0f0f0f] p-1 shadow-2xl transform-3d"
            style={{
              transform: `rotateX(${20 - scrollY * 0.05}deg) scale(${0.9 + scrollY * 0.0005})`,
              transition: 'transform 0.1s ease-out',
              opacity: Math.max(0, 1 - scrollY * 0.0005)
            }}
          >
            {/* Glow on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative rounded-xl border border-white/10 bg-[#0f0f0f] p-1 shadow-2xl overflow-hidden">
              {/* Mock Window Controls */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 rounded-t-xl flex items-center px-4 gap-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>

              {/* Dashboard Content Mock */}
              <div className="mt-8 p-6 bg-[#0f0f0f] rounded-b-xl overflow-hidden min-h-[600px] text-left">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {user && userProfile?.profile_picture_url ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-500">
                        <img src={userProfile.profile_picture_url} alt={userProfile.full_name} className="w-full h-full object-cover" />
                      </div>
                    ) : user && userProfile ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold border-2 border-primary-500">
                        {userProfile.full_name?.charAt(0) || '?'}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center animate-pulse">
                        <div className="w-6 h-6 bg-gray-500 rounded"></div>
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Welcome back{user && userProfile ? `, ${userProfile.full_name?.split(' ')[0]}` : ''}!
                      </h2>
                      <p className="text-gray-500 text-sm">Your Skills, Your Vibe, Your Network.</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Premium Member
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* Left Col - Signal Profile (DNA) */}
                  <div className="col-span-8">
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 h-full relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>

                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Signal Profile</h3>
                          <p className="text-gray-500 text-xs">AI-Verified Skill DNA</p>
                        </div>
                        <div className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/5">verified</div>
                      </div>

                      <div className="relative h-[300px] w-full flex items-center justify-center">
                        <DNAHelixCanvas
                          keywords={user && userDNA && userDNA.keywords ? userDNA.keywords.slice(0, 8) : [
                            { keyword: 'React' }, { keyword: 'Next.js' }, { keyword: 'TypeScript' },
                            { keyword: 'Node.js' }, { keyword: 'Design' }, { keyword: 'Strategy' },
                            { keyword: 'Leadership' }, { keyword: 'AI' }
                          ]}
                          className="scale-90"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Col - Stats & Matches */}
                  <div className="col-span-4 flex flex-col gap-4">
                    {/* Matches Card */}
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-5 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <span className="text-sm text-gray-400">New Matches</span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">12</div>
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`inline-block h-6 w-6 rounded-full ring-2 ring-[#1a1a1a] bg-gradient-to-br from-gray-700 to-gray-600`}></div>
                        ))}
                        <div className="h-6 w-6 rounded-full bg-[#2a2a2a] text-[10px] flex items-center justify-center text-gray-400 ring-2 ring-[#1a1a1a]">+8</div>
                      </div>
                    </div>

                    {/* Collaborations Card */}
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span className="text-sm text-gray-400">Collaborators</span>
                      </div>
                      <div className="text-3xl font-bold text-white">8</div>
                      <div className="mt-2 text-xs text-blue-400/80 bg-blue-500/10 py-1 px-2 rounded border border-blue-500/20 w-fit">
                        2 projects active
                      </div>
                    </div>

                    {/* Journal Card */}
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-5 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <span className="text-sm text-gray-400">Journal</span>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="h-1.5 w-3/4 bg-white/10 rounded-full"></div>
                        <div className="h-1.5 w-1/2 bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
