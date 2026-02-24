'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function EventPoller({ eventId, currentStatus }) {
  const router = useRouter()
  const statusRef = useRef(currentStatus)

  useEffect(() => {
    statusRef.current = currentStatus
  }, [currentStatus])

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/doppelganger')
        const data = await res.json()
        if (!res.ok) return

        const newStatus = data.event?.status
        if (newStatus && newStatus !== statusRef.current) {
          // Event status changed (e.g., admin started sprint) — refresh the page
          router.refresh()
          statusRef.current = newStatus
        }
      } catch {
        // Silent fail
      }
    }

    const interval = setInterval(poll, 15000)
    return () => clearInterval(interval)
  }, [eventId, router])

  return null
}
