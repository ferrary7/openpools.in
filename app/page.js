'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
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
        <HeroSection user={user} />

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
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="inline-block px-10 py-4 bg-white text-black rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </Link>
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
