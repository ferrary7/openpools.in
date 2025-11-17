'use client'

import { useEffect, useState } from 'react'

export default function CollabAnimation({ onComplete }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      if (onComplete) onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
        {/* Handshake Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Animated hands */}
            <svg className="w-24 h-24 text-primary-600 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 4a1 1 0 112 0v8a1 1 0 11-2 0V4zM8 8a1 1 0 011-1h.01a1 1 0 010 2H9a1 1 0 01-1-1zm-2 4a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm-2 4a1 1 0 011-1h.01a1 1 0 110 2H5a1 1 0 01-1-1zm14-4a1 1 0 011 1v.01a1 1 0 11-2 0V12a1 1 0 011-1zm2-4a1 1 0 011 1v.01a1 1 0 11-2 0V8a1 1 0 011-1zm0 8a1 1 0 011 1v.01a1 1 0 11-2 0V16a1 1 0 011-1z" />
            </svg>

            {/* Sparkles */}
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-ping">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.2H22l-6 4.8L18.4 22 12 17.2 5.6 22 8 14l-6-4.8h7.6L12 2z" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-ping delay-150">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.2H22l-6 4.8L18.4 22 12 17.2 5.6 22 8 14l-6-4.8h7.6L12 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Collaboration Started!
          </h2>
          <p className="text-gray-600 mb-4">
            You can now view each other's contact information and connect outside the platform
          </p>

          {/* Success Checkmark */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '50%',
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }

        .animate-confetti {
          animation: confetti forwards;
        }

        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  )
}
