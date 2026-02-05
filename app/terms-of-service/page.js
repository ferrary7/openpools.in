'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'

export default function TermsOfService() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-sm font-medium">Legal Agreement</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Terms of <span className="text-purple-500">Service</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            These terms govern your use of OpenPools and our commitment to providing you with a safe, professional networking platform.
          </p>
          <div className="text-sm text-gray-500 mt-6">
            Last updated: February 5, 2026
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="mb-12">
            <p className="text-gray-300 leading-relaxed mb-8">
              By accessing or using OpenPools, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service. These terms constitute a legally binding agreement between you and OpenPools.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Account & User Responsibilities
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Account Creation & Accuracy</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>You must provide accurate, current, and complete information during registration</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You may only create one account and must be at least 18 years old to use our service</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Professional Conduct</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Maintain professional standards in all interactions and communications</li>
              <li>Respect other users' privacy and intellectual property rights</li>
              <li>Do not engage in harassment, discrimination, or inappropriate behavior</li>
              <li>Use the platform for legitimate professional networking and collaboration</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Prohibited Activities</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Spam, phishing, or any form of unauthorized solicitation</li>
              <li>Uploading malicious code, viruses, or harmful content</li>
              <li>Attempting to gain unauthorized access to other accounts or systems</li>
              <li>Misrepresenting your identity, qualifications, or professional background</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Content & Intellectual Property
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Your Content Rights</h3>
            <p className="text-gray-300 mb-4">You retain ownership of all content you submit to OpenPools, including:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Profile information, resumes, and professional portfolios</li>
              <li>Messages, posts, and collaboration materials</li>
              <li>Project descriptions and work samples</li>
              <li>Any other user-generated content</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">License to OpenPools</h3>
            <p className="text-gray-300 mb-4">
              By submitting content, you grant OpenPools a limited, non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Display your content to facilitate networking and matching</li>
              <li>Process your professional data to generate DNA profiles and insights</li>
              <li>Improve our matching algorithms and platform functionality</li>
              <li>Backup and store your content for service reliability</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Content Standards</h3>
            <p className="text-gray-300 mb-4">All content must:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>Be accurate and truthful regarding your professional background</li>
              <li>Comply with applicable laws and regulations</li>
              <li>Respect intellectual property rights of others</li>
              <li>Maintain professional and appropriate standards</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Platform Services & Availability
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Service Availability</h3>
            <p className="text-gray-300 mb-6">
              We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Maintenance windows and upgrades may occasionally affect availability.
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Feature Updates</h3>
            <p className="text-gray-300 mb-6">
              We regularly update and improve our platform. New features may be added and existing features may be modified with appropriate notice.
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Premium Services</h3>
            <p className="text-gray-300 mb-6">
              Premium features require subscription and are subject to additional terms. Billing is automated and cancellation policies apply.
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Data Processing</h3>
            <p className="text-gray-300 mb-6">
              Our AI algorithms process your professional data to create DNA profiles and facilitate meaningful connections with other professionals.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Limitation of Liability & Disclaimers
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Service Disclaimer</h3>
            <p className="text-gray-300 mb-6">
              OpenPools is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be error-free or uninterrupted, or that defects will be corrected.
            </p>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Limitation of Damages</h3>
            <p className="text-gray-300 mb-6">
              In no event shall OpenPools be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.
            </p>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Maximum Liability</h3>
            <p className="text-gray-300 mb-6">
              Our total liability to you for any claim related to the service shall not exceed the amount you paid us in the twelve months preceding the claim, or $100, whichever is greater.
            </p>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Third-Party Content</h3>
            <p className="text-gray-300 mb-6">
              We are not responsible for content, accuracy, or conduct of other users. You interact with other professionals at your own risk and should use appropriate caution.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Termination & Changes
            </h2>
            
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Account Termination</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>You may terminate your account at any time through your account settings</li>
              <li>We may terminate accounts that violate these terms or our community guidelines</li>
              <li>Upon termination, your right to use the service ceases immediately</li>
              <li>We will delete your personal data as outlined in our Privacy Policy</li>
            </ul>
              
            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Terms Updates</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
              <li>We may modify these terms periodically to reflect service changes</li>
              <li>Material changes will be communicated via email or platform notifications</li>
              <li>Continued use after changes constitutes acceptance of new terms</li>
              <li>If you disagree with changes, you should discontinue use</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Contact & Dispute Resolution
            </h2>
            
            <p className="text-gray-300 mb-6">
              If you have questions about these terms or need clarification on any provision:
            </p>

            <p className="text-gray-300 mb-2">
              <strong className="text-white">Legal Team:</strong> legal@openpools.in
            </p>
            <p className="text-gray-300 mb-6">
              <strong className="text-white">General Support:</strong> support@openpools.in
            </p>

            <h3 className="text-xl font-semibold text-white mb-4 mt-8">Governing Law</h3>
            <p className="text-gray-300 mb-6">
              These terms are governed by the laws of India. Any disputes will be resolved through binding arbitration in accordance with the rules of the Indian Arbitration and Conciliation Act.
            </p>
          </section>
        </div>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to join our <span className="text-purple-500">professional community?</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              By signing up, you agree to these terms and join a network of professionals building the future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={user ? '/dashboard' : '/signup'}
                className="inline-block px-8 py-4 bg-white text-black rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]"
              >
                {user ? 'Go to Dashboard' : 'Accept & Sign Up'}
              </Link>
              <Link
                href="/privacy-policy"
                className="inline-block px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full text-lg font-bold hover:bg-white/20 transition-colors"
              >
                Read Privacy Policy
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
