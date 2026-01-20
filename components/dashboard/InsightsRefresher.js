'use client'

import { useEffect } from 'react'

export default function InsightsRefresher({ userId, keywords, signalClassification, complementarySkills }) {
  useEffect(() => {
    const refreshInsights = async () => {
      if (!userId || !keywords || keywords.length === 0) {
        return
      }

      try {
        // Trigger AI insights generation/refresh
        const response = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            skills: keywords,
            signalClassification: signalClassification || {},
            complementarySkills: complementarySkills || []
          })
        })

        if (response.ok) {
          console.log('Insights refreshed successfully')
        }
      } catch (error) {
        console.error('Error refreshing insights:', error)
      }
    }

    refreshInsights()
  }, [userId]) // Only run on mount with userId

  // This component doesn't render anything visible
  return null
}
