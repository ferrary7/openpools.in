'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DNAWrap from '@/components/dna/DNAWrap'

export default function UserDNAPage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [keywordProfile, setKeywordProfile] = useState(null)
  const [collaborationCount, setCollaborationCount] = useState(0)
  const [showcaseItems, setShowcaseItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isOwnDNA, setIsOwnDNA] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadUserDNAData()
  }, [params.id])

  const loadUserDNAData = async () => {
    try {
      const identifier = params.id

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // Fetch DNA data from public API
      const response = await fetch(`/api/dna/${identifier}`)

      if (!response.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const data = await response.json()

      // Set if viewing own DNA
      setIsOwnDNA(user?.id === data.profile.id)

      setProfile(data.profile)
      setKeywordProfile(data.keywordProfile)
      setCollaborationCount(data.collaborationCount)
      setShowcaseItems(data.showcaseItems || [])
    } catch (error) {
      console.error('Error loading DNA data:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/30 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full border-4 border-t-primary-500 border-r-purple-500 border-b-primary-500/20 border-l-purple-500/20 animate-spin"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">Sequencing Professional DNA...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="fixed inset-0 bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">DNA Not Found</h1>
          <p className="text-gray-400 mb-6">
            This professional DNA profile doesn't exist or has been removed.
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/dna')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300"
            >
              View Your DNA
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300"
            >
              Sign In to OpenPools
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <DNAWrap
      profile={profile}
      keywordProfile={keywordProfile}
      showcaseItems={showcaseItems}
      isOwnDNA={isOwnDNA}
    />
  )
}
