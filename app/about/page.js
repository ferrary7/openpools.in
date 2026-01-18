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
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-[#1E1E1E] shadow-sm border-b border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-3 sm:gap-4">
          <Link href="/">
            <Logo width={120} height={32} className="sm:w-[140px]" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors text-xs sm:text-sm">
              Home
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

      {/* Hero Section - Unique About Page Design */}
      <section className="relative min-h-screen md:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 md:pb-0 md:py-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#1E1E1E] to-gray-800" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10" />

        {/* Animated background elements */}
        <div className="absolute top-1/4 right-10 w-48 md:w-80 h-48 md:h-80 bg-primary-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-10 md:-left-20 w-48 md:w-80 h-48 md:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Diagonal line decoration */}
        <div className="absolute inset-0 overflow-hidden hidden sm:block">
          <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-primary-500/20 via-primary-500/5 to-transparent transform -translate-x-1/2" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left side - Content */}
            <div style={{ transform: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `translateY(${scrollY * 0.3}px)` : 'none' }} className="py-8 md:py-0">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-primary-500/20 border border-primary-500/50 rounded-full text-sm font-semibold text-primary-300 uppercase tracking-wider">
                  About OpenPools
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                We're Building the <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Future of Work</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                In a world where talent moves fast and opportunity is everywhere, the old way of networking is broken. We founded OpenPools to fix it.
              </p>

              <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-12 leading-relaxed">
                OpenPools uses advanced AI to understand who you really are - not just your resume, but your DNA as a professional. Then we connect you with people you're genuinely meant to work with.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {user ? (
                  <Link href="/dashboard" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-shadow text-center">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-shadow text-center">
                    Get Started
                  </Link>
                )}
                <a href="#our-story" className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-gray-100 transition-colors text-center">
                  Our Story
                </a>
              </div>
            </div>

            {/* Right side - Visual Stats */}
            <div style={{ transform: mounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `translateY(${scrollY * 0.15}px)` : 'none' }} className="py-8 md:py-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Stat Card 1 */}
                <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:border-primary-400/50 transition-all cursor-default">
                  <div className="text-3xl sm:text-4xl font-bold text-primary-400 mb-2">99.7%</div>
                  <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Match Accuracy</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Our humanoid AI nails hyperspecific professional matches with unprecedented precision</p>
                </div>

                {/* Stat Card 2 */}
                <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:border-purple-400/50 transition-all cursor-default">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">Human</div>
                  <h3 className="text-white text-base sm:text-lg font-semibold mb-2">+ AI Hybrid</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Humanoid AI that thinks like people, matches like an algorithm</p>
                </div>

                {/* Stat Card 3 */}
                <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:border-blue-400/50 transition-all cursor-default">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">Real</div>
                  <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Impact Focused</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">We measure success by the meaningful work our users build</p>
                </div>

                {/* Stat Card 4 */}
                <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:border-green-400/50 transition-all cursor-default">
                  <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">∞</div>
                  <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Possibilities</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Infinite career paths, one perfect match at a time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white" id="our-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                The Future of Professional Collaboration
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                We're disrupting outdated networking. OpenPools uses AI-powered intelligence to match professionals not just by skills, but by values, vision, and work style - creating collaborations that actually matter.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Traditional platforms treat professionals as keywords. We see the complete picture. Your DNA - your unique blend of skills, expertise, and experiences - deserves to be matched with people and projects where you'll truly thrive.
              </p>
              <p className="text-lg text-gray-600">
                We're building a world where exceptional professionals find each other effortlessly, collaborate without friction, and create work that has real impact. Because the best projects are built by people who belong together.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl opacity-5 blur-3xl" />
              <div className="relative bg-gradient-to-br from-primary-50 via-white to-purple-50 rounded-3xl p-12 border border-primary-200/50 shadow-xl">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-500 text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Authentic Connections</h3>
                      <p className="text-gray-600 mt-1">Real skills, real people, real opportunities</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-500 text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI Intelligence</h3>
                      <p className="text-gray-600 mt-1">Smart matching beyond keywords</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-500 text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Meaningful Impact</h3>
                      <p className="text-gray-600 mt-1">Projects that create lasting value</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Foundation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Core Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:border-primary-200 transition-all border border-gray-200">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Authenticity</h3>
              <p className="text-gray-600 leading-relaxed">
                Your resume is just the start. We help you showcase your complete professional DNA - the skills you excel at, the problems you solve, the values you stand for. Real professionals, real connections, zero pretense.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:border-primary-200 transition-all border border-gray-200">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Smart matching powered by advanced AI that goes beyond keywords. We understand work styles, collaboration patterns, and cultural fit - connecting you with professionals you'll genuinely want to work with.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:border-primary-200 transition-all border border-gray-200">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Impact</h3>
              <p className="text-gray-600 leading-relaxed">
                We don't measure success in features - we measure it by the incredible projects launched, careers transformed, and professional relationships that change how people work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Our Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet the Minds Behind OpenPools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by professionals who understand the challenges of finding the right collaborators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Team Member 1 */}
            <div className="group">
              <div className="relative">
                {/* Card Container */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500">
                  {/* Image Section */}
                  <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <img 
                      src="https://ifcwxqwquhnnbqzvbutb.supabase.co/storage/v1/object/public/profile-pictures/063aecf2-1786-49a8-9df4-18ddc9cab409/arya.jpeg"
                      alt="Aryan Sharma"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-8">
                    {/* Name */}
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                      Aryan Sharma
                    </h3>
                    
                    {/* Role - Elegant pill style */}
                    <div className="mb-6">
                      <span className="text-xs font-semibold tracking-widest text-primary-600 uppercase">
                        Founder & Technical Architect
                      </span>
                      <div className="h-0.5 w-12 bg-gradient-to-r from-primary-500 to-transparent mt-2" />
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 h-12">
                      Built the entire product from scratch and somehow became our Instagram personality too
                    </p>
                    
                    {/* DNA Link */}
                    <a href="https://www.openpools.in/dna/ferrary7" className="inline-flex items-center gap-2 text-gray-900 hover:text-primary-600 font-semibold text-sm group/link transition-colors">
                      View DNA 
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="group">
              <div className="relative">
                {/* Card Container */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500">
                  {/* Image Section */}
                  <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <img 
                      src="https://ifcwxqwquhnnbqzvbutb.supabase.co/storage/v1/object/public/profile-pictures/3c44f12a-c617-47d0-92e5-9aac08a18b79/dxrshsn.jpeg"
                      alt="Darshan Kumar V"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-8">
                    {/* Name */}
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                      Darshan Kumar V
                    </h3>
                    
                    {/* Role - Elegant pill style */}
                    <div className="mb-6">
                      <span className="text-xs font-semibold tracking-widest text-purple-600 uppercase">
                        Head of Growth
                      </span>
                      <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-transparent mt-2" />
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 h-12">
                      Sales wizard who believes the best magic happens when people build amazing things together
                    </p>
                    
                    {/* DNA Link */}
                    <a href="https://www.openpools.in/dna/dxrshn" className="inline-flex items-center gap-2 text-gray-900 hover:text-purple-600 font-semibold text-sm group/link transition-colors">
                      View DNA 
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="group">
              <div className="relative">
                {/* Card Container */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500">
                  {/* Image Section */}
                  <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <img 
                      src="https://ifcwxqwquhnnbqzvbutb.supabase.co/storage/v1/object/public/profile-pictures/52902ad5-8ea3-413e-a936-5d1562fd854f/himanshu.jpeg"
                      alt="Himanshu Patil"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-8">
                    {/* Name */}
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                      Himanshu Patil
                    </h3>
                    
                    {/* Role - Elegant pill style */}
                    <div className="mb-6">
                      <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
                        Director of Audience Development
                      </span>
                      <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-transparent mt-2" />
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 h-12">
                      Transforms strangers into a thriving community of builders who genuinely care about each other
                    </p>
                    
                    {/* DNA Link */}
                    <a href="https://www.openpools.in/dna/himanshupatil" className="inline-flex items-center gap-2 text-gray-900 hover:text-blue-600 font-semibold text-sm group/link transition-colors">
                      View DNA 
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Why Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              What Makes OpenPools Different
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Matching</h3>
                <p className="mt-2 text-gray-600">
                  Advanced algorithms that understand your professional DNA and connect you with ideal collaborators.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verified Skills</h3>
                <p className="mt-2 text-gray-600">
                  Professional signals extracted from your resume and verified against your achievements.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Secure Connections</h3>
                <p className="mt-2 text-gray-600">
                  Private messaging and collaboration tools built with privacy and security in mind.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Community Driven</h3>
                <p className="mt-2 text-gray-600">
                  Built by professionals for professionals. Your feedback shapes our platform's future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your People?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join OpenPools and connect with professionals who share your vision and passion.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
          >
            Get Started Now
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
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                Email us at{' '}
                <a href="mailto:contact@openpools.in" className="text-primary-400 hover:text-primary-300">
                  contact@openpools.in
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © 2025 OpenPools.in. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
