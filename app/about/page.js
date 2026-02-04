'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'

export default function AboutPage() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  // Check auth state on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
    }
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-primary-500/30">
      {/* Fixed Header */}
      <header className="bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-3 sm:gap-4">
          <Link href="/">
            <Logo width={120} height={32} className="sm:w-[140px]" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
              Home
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {authLoading ? (
                <div className="w-16 sm:w-20 h-7 sm:h-8 bg-white/5 rounded animate-pulse" />
              ) : user ? (
                <Link href="/dashboard" className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen md:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 md:pb-0 md:py-0">
        <div className="absolute inset-0 bg-[#0f0f0f]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left side - Content */}
            <div style={{ transform: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `translateY(${scrollY * 0.3}px)` : 'none' }} className="py-8 md:py-0">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-primary-300 backdrop-blur-sm">
                  About OpenPools
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                Building the <br />
                <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Future of Work.</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
                The old way of networking is broken. We're fixing it with AI that matches you based on your professional DNA—not just keywords.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link href="/dashboard" className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-medium transition-all hover:scale-105 shadow-[0_0_30px_-10px_rgba(232,68,153,0.5)] text-center">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/signup" className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-medium transition-all hover:scale-105 shadow-[0_0_30px_-10px_rgba(232,68,153,0.5)] text-center">
                    Get Started
                  </Link>
                )}
                <a href="#our-story" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-medium transition-all text-center backdrop-blur-sm">
                  Our Story
                </a>
              </div>
            </div>

            {/* Right side - Visual Stats */}
            <div style={{ transform: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `translateY(${scrollY * 0.15}px)` : 'none' }} className="py-8 md:py-0">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {/* Stat Card 1 */}
                <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-pink-400 mb-2">99.7%</div>
                  <h3 className="text-white text-sm font-semibold mb-1">Match Accuracy</h3>
                  <p className="text-gray-500 text-xs">Precision powered by semantic resonance</p>
                </div>

                {/* Stat Card 2 */}
                <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 mt-8">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">Hybrid</div>
                  <h3 className="text-white text-sm font-semibold mb-1">Human + AI</h3>
                  <p className="text-gray-500 text-xs">Intelligence with a human touch</p>
                </div>

                {/* Stat Card 3 */}
                <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 -mt-8">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">Real</div>
                  <h3 className="text-white text-sm font-semibold mb-1">Impact Focused</h3>
                  <p className="text-gray-500 text-xs">Meaningful work over vanity metrics</p>
                </div>

                {/* Stat Card 4 */}
                <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">∞</div>
                  <h3 className="text-white text-sm font-semibold mb-1">Possibilities</h3>
                  <p className="text-gray-500 text-xs">Infinite paths, one perfect match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 relative overflow-hidden" id="our-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-primary-500/10 border border-primary-500/20 text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                The Future of <br />
                <span className="text-gray-400">Professional Collaboration</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-400">
                <p>
                  We're disrupting outdated networking. OpenPools uses AI-powered intelligence to match professionals not just by skills, but by values, vision, and work style.
                </p>
                <p>
                  Traditional platforms treat professionals as keywords. We see the complete picture. Your DNA—your unique blend of skills, expertise, and experiences—deserves to be matched with projects where you'll truly thrive.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl opacity-20 blur-3xl transform rotate-6" />
              <div className="relative bg-[#121212] bg-opacity-80 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Authentic Connections</h3>
                      <p className="text-gray-400 leading-relaxed">Connecting real people with real opportunities, devoid of the usual corporate noise.</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/5"></div>

                  <div className="flex gap-5">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">AI Intelligence</h3>
                      <p className="text-gray-400 leading-relaxed">Smart matching that understands context, seniority, and nuance beyond simple keywords.</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/5"></div>

                  <div className="flex gap-5">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Meaningful Impact</h3>
                      <p className="text-gray-400 leading-relaxed">Empowering you to build projects that create lasting industry value.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] to-[#121212]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-white/5 border border-white/10 text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Our Foundation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Core Values
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The principles that guide every feature we build and every match we make.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center border border-primary-500/30">
                  <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Authenticity</h3>
              <p className="text-gray-400 leading-relaxed">
                Your resume is just the start. We help you showcase your complete professional DNA - the skills you excel at, the problems you solve, the values you stand for.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Intelligence</h3>
              <p className="text-gray-400 leading-relaxed">
                Smart matching powered by advanced AI that goes beyond keywords. We understand work styles, collaboration patterns, and cultural fit.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Impact</h3>
              <p className="text-gray-400 leading-relaxed">
                We don't measure success in features - we measure it by the incredible projects launched and careers transformed through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Team Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background gradient for team section */}
        <div className="absolute inset-0 bg-[#0f0f0f]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-white/5 border border-white/10 text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Our Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Meet the Minds Behind OpenPools
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Built by professionals who understand the challenges of finding the right collaborators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Team Member 1 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-primary-500/50 to-primary-600/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 h-full flex flex-col">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src="https://ifcwxqwquhnnbqzvbutb.supabase.co/storage/v1/object/public/profile-pictures/063aecf2-1786-49a8-9df4-18ddc9cab409/arya.jpeg"
                    alt="Aryan Sharma"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
                </div>

                <div className="p-8 flex-1 flex flex-col relative -mt-12">
                  <h3 className="text-2xl font-bold text-white mb-1">Aryan Sharma</h3>
                  <div className="mb-4">
                    <span className="text-xs font-bold tracking-widest text-primary-400 uppercase bg-primary-500/10 px-2 py-1 rounded">
                      Founder & Architect
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                    Built the entire product from scratch and somehow became our Instagram personality too.
                  </p>

                  <a href="https://www.openpools.in/dna/ferrary7" className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm group/link transition-colors mt-auto">
                    View DNA
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-purple-500/50 to-purple-600/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 h-full flex flex-col">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src="https://ifcwxqwquhnnbqzvbutb.supabase.co/storage/v1/object/public/profile-pictures/3c44f12a-c617-47d0-92e5-9aac08a18b79/dxrshsn.jpeg"
                    alt="Darshan Kumar V"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
                </div>

                <div className="p-8 flex-1 flex flex-col relative -mt-12">
                  <h3 className="text-2xl font-bold text-white mb-1">Darshan Kumar V</h3>
                  <div className="mb-4">
                    <span className="text-xs font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-2 py-1 rounded">
                      Head of Growth
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                    Sales wizard who believes the best magic happens when people build amazing things together.
                  </p>

                  <a href="https://www.openpools.in/dna/dxrshn" className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm group/link transition-colors mt-auto">
                    View DNA
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/50 to-blue-600/50 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10 h-full flex flex-col">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src="https://ifcwxqwquhnnbqzvbutb.supabase.co/storage/v1/object/public/profile-pictures/52902ad5-8ea3-413e-a936-5d1562fd854f/himanshu.jpeg"
                    alt="Himanshu Patil"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
                </div>

                <div className="p-8 flex-1 flex flex-col relative -mt-12">
                  <h3 className="text-2xl font-bold text-white mb-1">Himanshu Patil</h3>
                  <div className="mb-4">
                    <span className="text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2 py-1 rounded">
                      Director of Audience
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                    Transforms strangers into a thriving community of builders who genuinely care about each other.
                  </p>

                  <a href="https://www.openpools.in/dna/himanshupatil" className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-sm group/link transition-colors mt-auto">
                    View DNA
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Bento Style */}
      <section className="py-24 bg-[#0f0f0f] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              What Makes OpenPools Different
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Built for depth, designed for impact.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Matching</h3>
                <p className="text-gray-400">Advanced algorithms that understand your professional DNA and connect you with ideal collaborators.</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Verified Skills</h3>
                <p className="text-gray-400">Professional signals extracted from your resume and verified against your achievements.</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Secure Connections</h3>
                <p className="text-gray-400">Private messaging and collaboration tools built with privacy and security in mind.</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
                <p className="text-gray-400">Built by professionals for professionals. Your feedback shapes our platform's future.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0f0f0f]" />
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-primary-500/20 rounded-[100%] blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Find Your People?
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-white text-black px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo width={140} height={36} className="mb-4" />
              <p className="text-gray-500 text-sm">
                AI-powered professional matchmaking platform for meaningful connections.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-500 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-gray-500 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/signup" className="text-gray-500 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-gray-500 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <p className="text-gray-500 text-sm">
                Email us at{' '}
                <a href="mailto:contact@openpools.in" className="text-primary-400 hover:text-primary-300">
                  contact@openpools.in
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-gray-600 text-sm">
            © 2025 OpenPools.in. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
