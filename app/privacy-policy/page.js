'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'

export default function PrivacyPolicy() {
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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <Logo width={140} height={36} className="hover:opacity-80 transition-opacity" />
          </Link>
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
              <Link href="/signup" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors">
                Sign Up
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-primary-400 text-sm font-medium">Legal Document</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Privacy <span className="text-primary-500">Policy</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Your privacy is fundamental to everything we do. This policy explains how we collect, use, and protect your information when you use OpenPools.
          </p>
          <div className="text-sm text-gray-500 mt-6">
            Last updated: February 5, 2026
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="mb-12">
            <p className="text-gray-300 leading-relaxed mb-8">
              At OpenPools, we believe privacy is not just a legal requirement—it's a fundamental right. We're committed to transparency in how we handle your data and giving you control over your personal information. This policy outlines our practices in clear, understandable terms.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Account Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Name, email address, and contact information</li>
              <li>Professional title, company, and work experience</li>
              <li>Profile pictures and biographical information</li>
              <li>Authentication credentials and security preferences</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Professional DNA Data</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Skills and expertise keywords extracted from resumes and profiles</li>
              <li>Career progression and professional achievements</li>
              <li>Project histories and collaboration preferences</li>
              <li>Industry experience and technical competencies</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Platform Usage</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Login times, feature usage, and platform interactions</li>
              <li>Messages, collaboration requests, and network connections</li>
              <li>Search queries and matching preferences</li>
              <li>Device information and technical logs (anonymized)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              How We Use Your Information
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Core Platform Services</h3>
            <p className="text-gray-300 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Create and maintain your professional DNA profile</li>
              <li>Match you with relevant collaborators and opportunities</li>
              <li>Facilitate secure messaging and project coordination</li>
              <li>Provide personalized recommendations and insights</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Platform Improvement</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Analyze usage patterns to improve matching algorithms</li>
              <li>Develop new features based on user needs</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Provide customer support and resolve issues</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Data Protection & Security
            </h2>
            
            <p className="text-gray-300 mb-6">
              We implement multiple layers of security to protect your personal and professional data:
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Encryption</h3>
            <p className="text-gray-300 mb-6">
              All data is encrypted in transit and at rest using industry-standard AES-256 encryption. Messages support end-to-end encryption for sensitive communications.
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Access Controls</h3>
            <p className="text-gray-300 mb-6">
              Strict access controls ensure only authorized personnel can access your data, and all access is logged and monitored.
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Regular Audits</h3>
            <p className="text-gray-300 mb-6">
              We conduct regular security audits and penetration testing to identify and address potential vulnerabilities.
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Data Minimization</h3>
            <p className="text-gray-300 mb-6">
              We collect only the minimum data necessary to provide our services and delete unnecessary data regularly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Your Rights & Controls
            </h2>
            
            <p className="text-gray-300 mb-6">
              You have comprehensive rights regarding your personal data:
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Access Your Data</h3>
            <p className="text-gray-300 mb-6">
              Request a complete copy of all personal data we have about you in a portable format.
            </p>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Correct Information</h3>
            <p className="text-gray-300 mb-6">
              Update or correct any inaccurate personal information in your profile at any time.
            </p>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Delete Your Account</h3>
            <p className="text-gray-300 mb-6">
              Permanently delete your account and all associated data from our systems.
            </p>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Data Portability</h3>
            <p className="text-gray-300 mb-6">
              Export your data to use with other services, including your professional DNA profile.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Contact & Questions
            </h2>
            
            <p className="text-gray-300 mb-6">
              We're here to help with any questions about your privacy or this policy. Reach out to us:
            </p>

            <p className="text-gray-300 mb-2">
              <strong className="text-white">Privacy Team:</strong> privacy@openpools.in
            </p>
            <p className="text-gray-300 mb-6">
              <strong className="text-white">General Support:</strong> support@openpools.in
            </p>
          </section>
        </div>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to build your <span className="text-primary-500">Professional DNA?</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust OpenPools with their career data.
              Start building meaningful connections today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={user ? '/dashboard' : '/signup'}
                className="inline-block px-8 py-4 bg-white text-black rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </Link>
              <Link
                href="/about"
                className="inline-block px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full text-lg font-bold hover:bg-white/20 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 py-16 mt-20">
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
            <span>© 2026 OpenPools.in. All rights reserved.</span>
            <div className="flex gap-6">
              <span>Made with ❤️ for Builders</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
