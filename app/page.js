'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { Playfair_Display } from 'next/font/google'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})
import CompaniesSection from '@/components/ui/CompaniesSection'
import HeroSection from '@/components/ui/HeroSection'
import HowItWorks from '@/components/ui/HowItWorks'
import BentoGrid from '@/components/ui/BentoGrid'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
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

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Fixed Header - Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo width={120} height={32} className="sm:w-[140px]" />
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              About
            </Link>
            {authLoading ? (
              <div className="w-20 h-9 bg-white/5 rounded-full animate-pulse" />
            ) : user ? (
              <Link href="/dashboard" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-white hover:text-gray-300 transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        <HeroSection user={user} authLoading={authLoading} />

        {/* Counterpools — Brutalist Takeover Card */}
        <section className="relative overflow-hidden">
          {/* Architectural grid overlay */}
          <div
            className="absolute inset-0 bg-[#d84a1b] opacity-100"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.06) 40px, rgba(255,255,255,0.06) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.08) 40px, rgba(0,0,0,0.08) 41px)`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-transparent to-black" />

          <Link href="/counterpools" className="relative z-10 block group">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-36 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">

              {/* Left: Label + Headline */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 rounded-full bg-[#d84a1b] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">New Initiative</span>
                  <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                    Opens June 15, 2026
                  </span>
                </div>

                <h2 className={`${playfairDisplay.className} text-[64px] sm:text-[96px] md:text-[130px] lg:text-[160px] font-bold italic leading-[0.85] tracking-tighter text-white group-hover:text-white/90 transition-colors`}>
                  counter
                  <br />
                  <span className="text-[#d84a1b] group-hover:text-white transition-colors duration-500">pools.</span>
                </h2>

                <p className="mt-8 text-sm md:text-base text-white/60 font-medium uppercase tracking-[0.2em] max-w-md">
                  Solve problems that aren&apos;t yours. Like they are.
                </p>
              </div>

              {/* Right: Description + Arrow */}
              <div className="flex flex-col items-start md:items-end gap-8 md:pb-4">
                <p className="text-sm text-white/40 max-w-[280px] leading-relaxed md:text-right">
                  Industry experts post real-world challenges. Elite teams build the solutions. Built on openpools.
                </p>
                <div className="flex items-center gap-4 group-hover:gap-6 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Explore</span>
                  <div className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <span className="text-white text-lg group-hover:text-black transition-colors duration-300">&rarr;</span>
                  </div>
                </div>
              </div>

            </div>
          </Link>
        </section>

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <BentoGrid />

        {/* Companies Section - Dark Mode Adaptation */}
        <section className="py-20 bg-[#0f0f0f] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm mb-10 uppercase tracking-widest">Trusted by builders from</p>
            <CompaniesSection />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-600/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-transparent to-[#0f0f0f]"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Ready to find your <span className="text-primary-500">people?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of professionals building the future together.
              No noise, just signal.
            </p>
            {authLoading ? (
              <div className="inline-block px-10 py-4 bg-white/10 text-transparent rounded-full text-lg font-bold w-48 animate-pulse">
                Loading...
              </div>
            ) : (
              <Link
                href={user ? '/dashboard' : '/signup'}
                className="inline-block px-10 py-4 bg-white text-black rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
              >
                {user ? 'Go to Dashboard' : 'Get Started Now'}
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Logo width={140} height={36} className="mb-6 opacity-90" />
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                The first professional network powered by semantic resonance.
                Connecting builders through shared skill DNA.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:contact@openpools.in" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <span>© 2025 OpenPools.in. All rights reserved.</span>
            <div className="flex gap-6">
              <span>Made with ❤️ for Builders</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
