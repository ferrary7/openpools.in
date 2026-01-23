'use client'

import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  { icon: '🔍', text: 'Analyzing your resume...', duration: 2000 },
  { icon: '🎯', text: 'Extracting your skills and expertise...', duration: 2500 },
  { icon: '🏢', text: 'Identifying work experiences...', duration: 2000 },
  { icon: '✨', text: 'Building your professional DNA...', duration: 2500 },
  { icon: '🚀', text: 'Almost there! Finalizing details...', duration: 2000 },
]

export default function LoadingMessages({ message }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, LOADING_MESSAGES[currentMessageIndex].duration)

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95 // Cap at 95% until actual completion
        return prev + 1
      })
    }, 100)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [currentMessageIndex])

  const currentMessage = LOADING_MESSAGES[currentMessageIndex]

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      {/* Animated icon */}
      <div className="relative">
        <div className="text-6xl animate-bounce">
          {currentMessage.icon}
        </div>
        <div className="absolute -inset-2 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
      </div>

      {/* Loading message */}
      <div className="text-center space-y-3">
        <p className="text-lg font-medium text-gray-900 animate-pulse">
          {message || currentMessage.text}
        </p>
        <p className="text-sm text-gray-600">
          This usually takes 10-15 seconds
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          {progress}% complete
        </p>
      </div>

      {/* Fun facts or tips while waiting */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">💡 Tip:</span> Make sure your resume includes specific skills, technologies, and project details for the best matches!
        </p>
      </div>
    </div>
  )
}
