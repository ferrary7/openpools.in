'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-[#1E1E1E] shadow-sm border-b border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo width={140} height={36} />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white hover:text-gray-300 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#1E1E1E] to-gray-800"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="mb-8"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          >
            <Logo width={200} height={52} className="mx-auto mb-8" />
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          >
            Find your People. Build what Matters.
          </h1>

          <p
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            Connect with peers, collaborators, and mentors who share your exact skill patterns.
            Powered by AI-driven keyword matching.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <Link href="/signup" className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-shadow">
              Get Started Free
            </Link>
            <a href="#features" className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors">
              Learn More
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16 animate-bounce">
            <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How OpenPools Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform makes professional networking smart, simple, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">AI Keyword Extraction</h3>
              <p className="text-gray-600 text-center">
                Upload your resume or LinkedIn profile. Our AI extracts meaningful keywords that represent your skills, experience, and expertise.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Smart Matching Algorithm</h3>
              <p className="text-gray-600 text-center">
                Our algorithm calculates weighted compatibility scores based on skill overlaps, experience levels, and professional interests.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-primary-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Connect & Collaborate</h3>
              <p className="text-gray-600 text-center">
                Send collaboration requests to unlock contact info. Chat directly, share insights, and build meaningful professional relationships.
              </p>
            </div>
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
                  <p className="text-gray-600">Google Gemini analyzes your professional profile to extract the most relevant skills and keywords.</p>
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
            Ready to Find Your Tribe?
          </h2>
          <p className="text-xl text-primary-50 mb-8">
            Join OpenPools today and connect with professionals who share your skills and vision.
          </p>
          <Link href="/signup" className="inline-block bg-white text-primary-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1E1E] border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
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
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Technology</h3>
              <p className="text-gray-400 text-sm">
                Built with Next.js, Supabase & Google Gemini AI
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
