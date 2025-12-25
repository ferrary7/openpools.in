'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import JournalForm from '@/components/journal/JournalForm'
import JournalList from '@/components/journal/JournalList'
import ShowcaseLightTheme from '@/components/dna/ShowcaseLightTheme'

export default function ProfessionalCanvasPage() {
  const searchParams = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, journal, showcase
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    // Check if there's a tab parameter in the URL
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'journal', 'showcase'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (data) => {
    setRefresh((prev) => prev + 1)

    if (data.extractedKeywords && data.extractedKeywords.length > 0) {
      alert(
        `✅ Growth tracked! Extracted ${data.extractedKeywords.length} keywords and updated your profile.`
      )
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to your Professional Canvas
            </h1>
            <p className="text-gray-600 text-lg mt-2">Your growth story, achievements, and professional evolution in one place</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-6 mt-8 border-b border-gray-200 overflow-x-auto pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative px-1 py-2 font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-lg"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`relative px-1 py-2 font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === 'journal'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Growth Journal
              {activeTab === 'journal' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-lg"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('showcase')}
              className={`relative px-1 py-2 font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === 'showcase'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Professional Showcase
              {activeTab === 'showcase' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-lg"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Quick Add Section */}
              <div className="relative bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300/80 p-8 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-300/0 hover:from-primary-500/3 hover:to-primary-300/3 rounded-2xl transition-all duration-300"></div>
                <div className="relative">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Start</h2>
                  <p className="text-gray-700 mb-6">What would you like to do today?</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setActiveTab('journal')}
                      className="group relative overflow-hidden rounded-xl border-2 border-primary-300/60 hover:border-primary-500/80 bg-gradient-to-br from-primary-50 to-primary-100/30 hover:from-primary-100 hover:to-primary-200/50 p-6 text-left transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-200/40 to-primary-100/40 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/40 transition-all">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Log Your Growth</h3>
                        </div>
                        <p className="text-gray-800 text-sm">Document your progress, lessons learned, and milestones</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('showcase')}
                      className="group relative overflow-hidden rounded-xl border-2 border-primary-300/60 hover:border-primary-500/80 bg-gradient-to-br from-primary-50 to-primary-100/30 hover:from-primary-100 hover:to-primary-200/50 p-6 text-left transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-200/40 to-primary-100/40 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/40 transition-all">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Add Achievement</h3>
                        </div>
                        <p className="text-gray-800 text-sm">Showcase your best work, certifications, and accomplishments</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Highlights Section */}
              <div className="relative bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-300/0 rounded-2xl transition-all duration-300"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center border border-primary-300/60">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Progress at a Glance</h2>
                  </div>
                  <p className="text-gray-800 mb-6">Start by logging your growth moments or adding achievements to build your professional showcase.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gradient-to-br from-primary-100/50 to-primary-50/50 border border-primary-300/40 p-4">
                      <p className="text-sm font-semibold text-primary-900 mb-1">💡 Tip: Growth Entries</p>
                      <p className="text-sm text-primary-800">Reflect on challenges overcome, skills learned, and insights gained</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-primary-100/50 to-primary-50/50 border border-primary-300/40 p-4">
                      <p className="text-sm font-semibold text-primary-900 mb-1">⭐ Tip: Showcase Items</p>
                      <p className="text-sm text-primary-800">Pin your best 3 items to feature on your professional certificate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Journal Tab */}
          {activeTab === 'journal' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="relative bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/3 to-primary-300/3 rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center border border-primary-300/60">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Document Your Growth</h2>
                  </div>
                  <JournalForm onSuccess={handleSuccess} />
                </div>
              </div>

              <div className="relative bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/3 to-primary-300/3 rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center border border-primary-300/60">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Journey</h2>
                  </div>
                  <JournalList refresh={refresh} />
                </div>
              </div>
            </div>
          )}

          {/* Showcase Tab */}
          {activeTab === 'showcase' && (
            <div className="animate-fadeIn">
              {!loading && profile && (
                <ShowcaseLightTheme profile={profile} isOwnDNA={true} />
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
