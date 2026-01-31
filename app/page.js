'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import CompaniesSection from '@/components/ui/CompaniesSection'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [stepsScroll, setStepsScroll] = useState(0)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
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
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Calculate horizontal scroll for steps section
      const stepsSection = document.getElementById('steps-section')
      if (stepsSection) {
        const rect = stepsSection.getBoundingClientRect()
        const sectionTop = window.scrollY + rect.top
        const sectionHeight = rect.height
        const scrollPast = window.scrollY - sectionTop

        // Progress from 0 to 1 as user scrolls through the section
        const progress = Math.max(0, Math.min(1, scrollPast / (sectionHeight * 0.6)))
        setStepsScroll(progress)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-[#1E1E1E] shadow-sm border-b border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-3 sm:gap-4">
          <Logo width={120} height={32} className="sm:w-[140px]" />
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/about" className="text-white hover:text-gray-300 transition-colors text-xs sm:text-sm">
              About Us
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {authLoading ? (
                <div className="w-16 sm:w-20 h-7 sm:h-8 bg-gray-700 rounded animate-pulse" />
              ) : user ? (
                <Link href="/dashboard" className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-white hover:text-gray-300 transition-colors text-xs sm:text-sm">
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

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-24">
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#1E1E1E] to-gray-800"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Hero Text */}
          <div className="text-center mb-8 sm:mb-12" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
            <Logo width={140} height={36} className="mx-auto mb-4 sm:mb-8 sm:w-[200px]" />

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-6 leading-tight">
              Find your People. Build what Matters.
            </h1>

            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto px-2 sm:px-0">
              Connect with peers, collaborators, and mentors who share your exact skill patterns.
              Powered by AI-driven keyword matching.
            </p>

            <div className="flex flex-col gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-2 sm:px-0 sm:flex-row">
              {user ? (
                <Link href="/dashboard" className="btn-primary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-2.5 sm:py-4 shadow-lg hover:shadow-xl transition-shadow">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/signup" className="btn-primary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-2.5 sm:py-4 shadow-lg hover:shadow-xl transition-shadow">
                  Get Started Free
                </Link>
              )}
              <a href="#steps-section" className="bg-white text-gray-900 px-6 sm:px-8 py-2.5 sm:py-4 rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-gray-100 transition-colors">
                Learn More
              </a>
            </div>
          </div>

          {/* Visual Product Preview */}
          <div
            className="max-w-4xl mx-auto mb-12 sm:mb-16 px-2 sm:px-0"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Match Card 1 */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:border-primary-400/50 transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold text-lg">Sarah Chen</h3>
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-semibold border border-green-400/30 whitespace-nowrap">
                        94% Match
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">Senior Product Manager • Ex-Google</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs border border-white/20">ML</span>
                      <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs border border-white/20">Strategy</span>
                      <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs border border-white/20">Leadership</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Card 2 */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:border-primary-400/50 transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold text-lg">Alex Kumar</h3>
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-semibold border border-green-400/30 whitespace-nowrap">
                        89% Match
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">Full Stack Engineer • Founder</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs border border-white/20">React</span>
                      <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs border border-white/20">Node.js</span>
                      <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs border border-white/20">AWS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              Get matched with professionals who share your skills and expertise
            </p>

            {/* Companies Section */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <CompaniesSection />
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="text-center animate-bounce">
            <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* How It Works Section - Horizontal Scroll */}
      <section id="steps-section" className="relative bg-white md:h-[300vh] h-[400vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          {/* Title overlay - fades out as we scroll */}
          <div
            className="absolute top-16 md:top-20 left-0 right-0 text-center z-20 transition-opacity duration-500 px-4"
            style={{ opacity: Math.max(0, 1 - stepsScroll * 3) }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
              How openpools Works
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to find your perfect professional match
            </p>
          </div>

          {/* Horizontal container */}
          <div
            className="flex transition-transform duration-300 ease-out pt-32 md:pt-0"
            style={{
              transform: `translateX(-${stepsScroll * 200}vw)`,
              width: '300vw'
            }}
          >
            {/* Step 1 */}
            <div className="w-screen flex-shrink-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl w-full">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                  <div className="md:w-1/2 w-full">
                    <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
                      <span className="bg-primary-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs">1</span>
                      Upload Your Profile
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                      AI Resonates Your Signals
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-6">
                      Simply upload your Resume PDF. Our AI agent analyzes your document and automatically extracts meaningful signals representing your skills, experience, and expertise.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                      <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">Example extracted skills:</p>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-100 text-primary-700 rounded-full text-xs md:text-sm">Machine Learning</span>
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-100 text-primary-700 rounded-full text-xs md:text-sm">Python</span>
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-100 text-primary-700 rounded-full text-xs md:text-sm">Product Strategy</span>
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-100 text-primary-700 rounded-full text-xs md:text-sm">React</span>
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary-100 text-primary-700 rounded-full text-xs md:text-sm">+15 more</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/2 w-full">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl md:rounded-2xl p-4 md:p-8 border-2 border-primary-200">
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="h-2.5 md:h-3 bg-gray-200 rounded w-3/4 mb-1.5 md:mb-2" />
                            <div className="h-1.5 md:h-2 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
                          <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-1 md:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-xs md:text-sm text-gray-500">Drop your resume or LinkedIn PDF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="w-screen flex-shrink-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl w-full">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                  <div className="md:w-1/2 w-full md:order-1 order-2">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl md:rounded-2xl p-4 md:p-8 border-2 border-primary-200">
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg space-y-2 md:space-y-3">
                        {/* Match item 1 */}
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="h-2.5 md:h-3 bg-gray-300 rounded w-2/3 mb-1" />
                            <div className="h-1.5 md:h-2 bg-gray-200 rounded w-1/2" />
                          </div>
                          <span className="bg-green-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-bold">94%</span>
                        </div>

                        {/* Match item 2 */}
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="h-2.5 md:h-3 bg-gray-300 rounded w-2/3 mb-1" />
                            <div className="h-1.5 md:h-2 bg-gray-200 rounded w-1/2" />
                          </div>
                          <span className="bg-gray-400 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-bold">89%</span>
                        </div>

                        {/* Match item 3 */}
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg opacity-50">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="h-2.5 md:h-3 bg-gray-200 rounded w-2/3 mb-1" />
                            <div className="h-1.5 md:h-2 bg-gray-100 rounded w-1/2" />
                          </div>
                          <span className="bg-gray-300 text-gray-600 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-bold">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/2 w-full md:order-2 order-1">
                    <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
                      <span className="bg-primary-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs">2</span>
                      Discover Matches
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                      See Your Compatibility Scores
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-6">
                      Our algorithm analyzes skill overlaps, experience levels, and professional interests to calculate weighted compatibility scores. Browse curated matches ranked by relevance to your profile.
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base text-gray-700">Matches sorted by compatibility percentage</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base text-gray-700">See shared skills and interests at a glance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="w-screen flex-shrink-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl w-full">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                  <div className="md:w-1/2 w-full">
                    <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
                      <span className="bg-primary-600 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs">3</span>
                      Connect & Collaborate
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                      Build Real Connections that Matter
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-6">
                      Send collaboration requests to professionals who interest you. Once accepted, unlock contact information and start chatting directly through our built-in messaging platform.
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      <li className="flex items-start gap-2 md:gap-3">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base text-gray-700">Privacy-first: Contact info shared only after approval</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base text-gray-700">Real-time messaging built into the platform</span>
                      </li>
                    </ul>
                  </div>

                  <div className="md:w-1/2 w-full">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl md:rounded-2xl p-4 md:p-8 border-2 border-primary-200">
                      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div className="h-2.5 md:h-3 bg-gray-300 rounded w-20 md:w-24 mb-1" />
                            <div className="h-1.5 md:h-2 bg-gray-200 rounded w-12 md:w-16" />
                          </div>
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          {/* Message bubble */}
                          <div className="flex gap-1.5 md:gap-2">
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-400 rounded-full flex-shrink-0" />
                            <div className="bg-gray-100 rounded-lg rounded-tl-none p-2 md:p-3 max-w-[80%]">
                              <div className="h-1.5 md:h-2 bg-gray-300 rounded w-24 md:w-32 mb-1" />
                              <div className="h-1.5 md:h-2 bg-gray-300 rounded w-16 md:w-24" />
                            </div>
                          </div>

                          {/* Reply bubble */}
                          <div className="flex gap-1.5 md:gap-2 justify-end">
                            <div className="bg-primary-500 rounded-lg rounded-tr-none p-2 md:p-3 max-w-[80%]">
                              <div className="h-1.5 md:h-2 bg-primary-300 rounded w-20 md:w-28 mb-1" />
                              <div className="h-1.5 md:h-2 bg-primary-300 rounded w-14 md:w-20" />
                            </div>
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-primary-400 rounded-full flex-shrink-0" />
                          </div>

                          {/* Typing indicator */}
                          <div className="flex gap-1.5 md:gap-2">
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-400 rounded-full flex-shrink-0" />
                            <div className="bg-gray-100 rounded-lg rounded-tl-none p-2 md:p-3">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1.5 md:gap-2 z-20">
            <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all ${stepsScroll < 0.33 ? 'bg-primary-600 md:w-8 w-6' : 'bg-gray-300'}`} />
            <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all ${stepsScroll >= 0.33 && stepsScroll < 0.66 ? 'bg-primary-600 md:w-8 w-6' : 'bg-gray-300'}`} />
            <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all ${stepsScroll >= 0.66 ? 'bg-primary-600 md:w-8 w-6' : 'bg-gray-300'}`} />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose OpenPools?
            </h2>
            <p className="text-xl text-gray-600">
              Built for professionals who value meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card bg-white hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy First</h3>
                  <p className="text-gray-600">Your contact information stays private until you approve collaboration requests. You're in control.</p>
                </div>
              </div>
            </div>

            <div className="card bg-white hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600">Our Human Powered AI analyzes your professional profile to extract the most relevant skills and keywords.</p>
                </div>
              </div>
            </div>

            <div className="card bg-white hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Messaging</h3>
                  <p className="text-gray-600">Built-in chat lets you communicate seamlessly with your collaborators without leaving the platform.</p>
                </div>
              </div>
            </div>

            <div className="card bg-white hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Journal</h3>
                  <p className="text-gray-600">Track your networking journey with a built-in journal to document insights and reflections.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#1E1E1E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary-400 mb-2">AI-Powered</div>
              <div className="text-gray-300">Keyword Extraction</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-400 mb-2">100%</div>
              <div className="text-gray-300">Privacy Protected</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-400 mb-2">Smart</div>
              <div className="text-gray-300">Matching Algorithm</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary-400 mb-2">Real-time</div>
              <div className="text-gray-300">Messaging & Notifications</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {user ? 'Welcome Back!' : 'Ready to Find Your Tribe?'}
          </h2>
          <p className="text-xl text-primary-50 mb-8">
            {user
              ? 'Continue connecting with professionals who share your skills and vision.'
              : 'Join OpenPools today and connect with professionals who share your skills and vision.'
            }
          </p>
          <Link
            href={user ? '/dashboard' : '/signup'}
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl"
          >
            {user ? 'Go to Dashboard' : 'Get Started Now'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1E1E] border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo width={140} height={36} className="mb-4" />
              <p className="text-gray-400 text-sm">
                AI-powered professional matchmaking platform for meaningful connections.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <form
                action={`mailto:contact@openpools.in`}
                method="GET"
                className="space-y-3"
              >
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
                />
                <textarea
                  name="body"
                  placeholder="Your message..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 resize-none"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Send Message
                </button>
              </form>
              <p className="text-gray-500 text-xs mt-3">
                Or email us directly at{' '}
                <a href="mailto:contact@openpools.in" className="text-primary-400 hover:text-primary-300">
                  contact@openpools.in
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm flex flex-col md:flex-row items-center justify-center gap-4">
            <span>© 2025 OpenPools.in. All rights reserved.</span>
            <a href="/privacy-policy" className="text-primary-400 hover:text-primary-300 ml-2">Privacy Policy</a>
            <a href="/terms-of-service" className="text-primary-400 hover:text-primary-300 ml-2">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
