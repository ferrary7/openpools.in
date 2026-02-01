'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DNAPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    redirectToUserDNA()
  }, [])

  const redirectToUserDNA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get user's profile to access username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      // Redirect to user's specific DNA page (use username if available)
      router.push(`/dna/${profile?.username || user.id}`)
    } catch (error) {
      console.error('Error redirecting to DNA:', error)
      router.push('/login')
    }
  }

  return (
    <div className="fixed inset-0 bg-[#1E1E1E] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/30 animate-ping"></div>
          <div className="relative w-20 h-20 rounded-full border-4 border-t-primary-500 border-r-purple-500 border-b-primary-500/20 border-l-purple-500/20 animate-spin"></div>
        </div>
        <p className="text-gray-300 text-lg font-medium">Redirecting to your DNA...</p>
      </div>
    </div>
  )
}
