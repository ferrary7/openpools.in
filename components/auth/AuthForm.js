'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthForm({ mode = 'login' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gisReady, setGisReady] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const buttonRef = useRef(null)

  const handleCredentialResponse = async ({ credential }) => {
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      })

      if (signInError) throw signInError

      // Run post-auth logic server-side and get redirect URL
      const res = await fetch('/api/auth/finalize', { method: 'POST' })
      const { redirectTo } = await res.json()
      router.push(redirectTo || '/dashboard')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: false,
      })
      setGisReady(true)
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (gisReady && buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        shape: 'rectangular',
        width: buttonRef.current.offsetWidth || 400,
      })
    }
  }, [gisReady, mode])

  return (
    <div className="space-y-4 w-full max-w-md">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white">
          <span className="text-sm font-medium text-gray-700">Signing in...</span>
        </div>
      )}

      <div
        ref={buttonRef}
        className={`w-full ${loading ? 'hidden' : ''}`}
        style={{ minHeight: '44px' }}
      />

      {!gisReady && !loading && (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white opacity-50">
          <span className="text-sm font-medium text-gray-700">Loading...</span>
        </div>
      )}
    </div>
  )
}
