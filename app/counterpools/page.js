'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function CounterpoolsPage() {
  const [onboardingCompleted, setOnboardingCompleted] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      setOnboardingCompleted(profile?.onboarding_completed ?? false)
    }
    checkOnboarding()
  }, [])

  const onboardHref = onboardingCompleted ? '/dashboard' : '/onboarding'

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className} overflow-x-hidden pb-32`}>

      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#d84a1b] transition-colors">
            ← Back to OpenPools
          </Link>
          <Link href="/counterpools/browse" className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d84a1b] hover:bg-[#e04500] text-white px-6 py-2 rounded transition-colors">
            Browse Problems
          </Link>
        </div>
      </div>

      {/* Top Background Pattern Section (Hero) */}
      <div className="relative w-full h-[75vh] min-h-[600px] md:min-h-[700px] flex flex-col items-center justify-center overflow-hidden mt-16">
        <div className="absolute inset-0 bg-[#d84a1b]"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/40 to-black"></div>

        <div className="relative z-10 flex flex-col items-center justify-center mt-[-60px]">
          <h1 className={`${playfairDisplay.className} text-[48px] sm:text-[72px] md:text-[96px] lg:text-[130px] text-white italic drop-shadow-2xl leading-none tracking-tighter`}>
            counterpools
          </h1>
          <p className="mt-6 px-4 text-xs sm:text-sm md:text-base lg:text-lg font-medium text-white/80 uppercase tracking-[0.2em] text-center max-w-[90vw] sm:max-w-none leading-relaxed">
            Solve problems that aren't yours. Like they are.
          </p>
        </div>
      </div>

      {/* Main Content Area - Creative Editorial Layout */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 -mt-32 space-y-8">

        {/* Asymmetrical 2-Phase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Phase 1: Post Problems (Stark Contrast - Bright Orange) */}
          <Link href="/counterpools/problems" className="lg:col-span-5 relative bg-[#e04500] text-black p-10 md:p-14 overflow-hidden group hover:-translate-y-2 transition-transform duration-500 ease-out flex flex-col justify-between min-h-[400px]">
            {/* Massive background number bleeding off edge */}
            <div className={`${playfairDisplay.className} absolute -bottom-10 -right-10 text-[280px] font-bold italic text-black opacity-10 leading-none pointer-events-none group-hover:scale-105 transition-transform duration-700`}>
              01
            </div>

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6 opacity-70">
                Phase One // Open Forum
              </p>
              <h2 className={`${playfairDisplay.className} text-5xl md:text-6xl font-bold italic leading-[1.1] mb-6`}>
                Post a <br /> Problem.
              </h2>
              <p className="text-sm md:text-base font-medium opacity-80 max-w-[280px] leading-relaxed">
                Industry experts: face a challenge in tech, health, or society? Submit it to our forum and let elite teams build a solution.
              </p>
            </div>

            <div className="relative z-10 mt-12 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-[#e04500] transition-colors duration-300">
                <span className="text-xl">&rarr;</span>
              </div>
              <span className="font-bold uppercase text-xs tracking-widest">Submit Challenge</span>
            </div>
          </Link>

          {/* Phase 2: Join Hackathon (Dark, Sleek, Wide) */}
          <Link href="/counterpools/problems" className="lg:col-span-7 relative bg-[#0a0a0a] border border-white/10 p-10 md:p-14 overflow-hidden group hover:-translate-y-2 transition-transform duration-500 ease-out flex flex-col justify-between min-h-[400px]">
            {/* Massive background number */}
            <div className={`${playfairDisplay.className} absolute -top-20 -right-10 text-[320px] font-bold italic text-white opacity-[0.02] leading-none pointer-events-none group-hover:-translate-x-4 transition-transform duration-700`}>
              02
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <p className="text-xs font-bold text-white/50 uppercase tracking-[0.3em]">
                  Phase Two // Hackathon
                </p>
                <div className="h-px bg-white/20 flex-grow max-w-[100px]"></div>
                <div className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#d84a1b] rounded-full"></span>
                  Opens June 15, 2026
                </div>
              </div>

              <h2 className={`${playfairDisplay.className} text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold italic leading-[1.1] mb-6 text-white`}>
                Join the <br /> Fray.
              </h2>
              <p className="text-sm md:text-base font-light text-white/60 max-w-[380px] leading-relaxed">
                Developers: build your team, get matched to real-world problems via intent, and build solutions that matter.
              </p>
            </div>

            <div className="relative z-10 mt-12 flex items-center justify-between border-t border-white/10 pt-8">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] bg-white/5 border-dashed flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                    00
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Awaiting Teams</span>
              </div>

              <div className="bg-white/5 border border-white/10 text-white/40 px-8 py-4 font-bold text-sm uppercase tracking-widest cursor-not-allowed">
                Opens June 15, 2026
              </div>
            </div>
          </Link>
        </div>

        {/* Minimalist Wireframe Workflow Section */}
        <div className="mt-16 md:mt-24 pt-16 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <h3 className={`${playfairDisplay.className} text-4xl md:text-5xl font-bold italic text-white`}>
              The Process
            </h3>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 max-w-xs text-right">
              How problems evolve into solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Step 1 */}
            <div className="p-8 md:p-12 group hover:bg-white/[0.02] transition-colors">
              <div className="text-sm font-bold text-[#e04500] mb-8">01 —</div>
              <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">Collect & Pool</h4>
              <p className="text-sm text-white/50 leading-relaxed font-light">
                Experts post real-world problems to the forum, creating a massive, diverse pool of high-impact challenges.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 md:p-12 group hover:bg-white/[0.02] transition-colors">
              <div className="text-sm font-bold text-[#e04500] mb-8">02 —</div>
              <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">Match & Assign</h4>
              <p className="text-sm text-white/50 leading-relaxed font-light">
                Teams form and are intelligently assigned to problems based on keyword matching, technical stack, and intent.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 md:p-12 group hover:bg-white/[0.02] transition-colors">
              <div className="text-sm font-bold text-[#e04500] mb-8">03 —</div>
              <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">Solve & Refine</h4>
              <p className="text-sm text-white/50 leading-relaxed font-light">
                Teams build solutions, tag the original expert for mentorship, undergo rigorous grading, and refine the final product.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Editorial Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-16 pb-16">
          {/* Prize Box - Minimalist */}
          <div className="md:col-span-6 lg:col-span-4 border border-white/10 p-10 flex flex-col justify-between min-h-[240px] relative overflow-hidden group hover:border-[#e04500] transition-colors">
            <div className="absolute -right-6 -bottom-6 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">₹</div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Reward</h3>
            <div>
              <p className="text-sm font-light text-white/60 mb-2">Total Prize Pool</p>
              <p className={`${playfairDisplay.className} text-5xl font-bold text-white`}>
                ₹1,00,000
              </p>
            </div>
          </div>

          {/* Onboard Block */}
          <div className="md:col-span-6 lg:col-span-4 border border-white/10 p-10 flex flex-col justify-between min-h-[240px] hover:border-[#e04500] transition-colors group">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-8">Get Started</h3>
            <div className="flex flex-col gap-6 flex-grow">
              <div>
                <p className={`${playfairDisplay.className} text-2xl font-bold italic text-white mb-2`}>onboard to openpools.in</p>
                <p className="text-sm text-white/40 leading-relaxed font-light">Build your skill DNA, find your people, and network with builders across India.</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-white/60">
                  <span className="w-1 h-1 rounded-full bg-[#e04500] flex-shrink-0" />Network with elite builders
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60">
                  <span className="w-1 h-1 rounded-full bg-[#e04500] flex-shrink-0" />Collaborate on real problems
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60">
                  <span className="w-1 h-1 rounded-full bg-[#e04500] flex-shrink-0" />Get matched by skill DNA
                </li>
              </ul>
            </div>
            <Link
              href={onboardHref}
              className="mt-8 flex items-center justify-between text-sm font-bold text-white border-t border-white/10 pt-6 group-hover:text-[#e04500] transition-colors"
            >
              <span className="uppercase tracking-widest text-xs">{onboardingCompleted ? 'Go to Dashboard' : 'Join openpools'}</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
            </Link>
          </div>

          {/* Partners Block */}
          <div className="md:col-span-12 lg:col-span-4 border border-white/10 p-10 flex flex-col justify-between min-h-[240px]">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-8">In Partnership With</h3>

            <div className="flex flex-col gap-6">
              <a href="https://openpools.in" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Hosted By</p>
                <img src="/logo.svg" alt="openpools.in" className="h-6 opacity-90" />
              </a>
              <div className="w-12 h-px bg-white/20"></div>
              <a href="https://codinggita.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Powered By</p>
                <img src="/cg.png" alt="CodingGita" className="h-8 object-contain" />
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
