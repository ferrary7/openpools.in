'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isUUID } from '@/lib/username'
import DNAWrap from '@/components/dna/DNAWrap'

export default function UserDNAPage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [keywordProfile, setKeywordProfile] = useState(null)
  const [collaborations, setCollaborations] = useState([])
  const [showcaseItems, setShowcaseItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isOwnDNA, setIsOwnDNA] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadUserDNAData()
  }, [params.id])

  const loadUserDNAData = async () => {
    try {
      const identifier = params.id

      // Check if viewing own DNA
      const { data: { user } } = await supabase.auth.getUser()

      // Determine if identifier is UUID or username
      const isId = isUUID(identifier)

      // Load profile - query by ID or username
      let profileQuery = supabase
        .from('profiles')
        .select('*')

      if (isId) {
        profileQuery = profileQuery.eq('id', identifier)
      } else {
        profileQuery = profileQuery.eq('username', identifier)
      }

      const { data: profileData, error: profileError } = await profileQuery.single()

      if (profileError || !profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      // Set if viewing own DNA (compare with actual user ID)
      setIsOwnDNA(user?.id === profileData.id)

      // Load keywords using the actual user ID from profile
      const { data: keywordData } = await supabase
        .from('keyword_profiles')
        .select('*')
        .eq('user_id', profileData.id)
        .single()

      // Load collaborations using the actual user ID from profile
      const { data: collabData } = await supabase
        .from('collaborations')
        .select('*')
        .or(`sender_id.eq.${profileData.id},receiver_id.eq.${profileData.id}`)
        .eq('status', 'accepted')

      // Load showcase items
      const showcaseResponse = await fetch(`/api/showcase?user_id=${profileData.id}`)
      const showcaseData = await showcaseResponse.json()

      setProfile(profileData)
      setKeywordProfile(keywordData)
      setCollaborations(collabData || [])
      setShowcaseItems(showcaseData.items || [])
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
          <button
            onClick={() => router.push('/dna')}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300"
          >
            View Your DNA
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Scroll-Based DNA Wrap - Spotify Style */}
      <DNAWrap
        profile={profile}
        keywordProfile={keywordProfile}
        showcaseItems={showcaseItems}
        isOwnDNA={isOwnDNA}
      />
    </div>
  )
}
