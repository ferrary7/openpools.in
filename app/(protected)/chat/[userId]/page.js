'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  // Fetch profile and messages
  useEffect(() => {
    fetchProfile()
    fetchMessages()
  }, [params.userId])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (isCollaborating) {
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [isCollaborating, params.userId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${params.userId}`)
      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setIsCollaborating(data.isCollaborating || false)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?userId=${params.userId}`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!message.trim() || sending) return

    setSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: params.userId,
          content: message.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add message to local state immediately
      setMessages(prev => [...prev, data.message])
      setMessage('')
      scrollToBottom()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
            {profile?.job_title && profile?.company && (
              <p className="text-sm text-gray-600">
                {profile.job_title} at {profile.company}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {isCollaborating ? (
        <>
          {/* Chat Messages Area */}
          <div className="card mb-4 h-96 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-sm text-gray-600 max-w-sm">
                    Start a conversation with {profile?.full_name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isSent = msg.sender_id === currentUserId
                  return (
                    <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isSent ? 'order-2' : 'order-1'}`}>
                        <div className={`px-4 py-2 rounded-lg ${
                          isSent
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm break-words">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="card mb-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                  placeholder="Type your message... (Press Enter to send)"
                  className="input-field resize-none"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>

          {/* Contact Info Helper */}
          <div className="card bg-green-50 border-green-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You're Collaborating!
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              You can also reach out directly using their contact info:
            </p>
            <div className="space-y-2 text-sm">
              {profile?.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${profile.email}`} className="text-primary-600 hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile?.phone_number && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${profile.phone_number}`} className="text-primary-600 hover:underline">
                    {profile.phone_number}
                  </a>
                </div>
              )}
              {profile?.linkedin_url && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              <Link href={`/user/${params.userId}`} className="text-primary-600 hover:underline font-medium flex items-center gap-1 mt-2">
                View Full Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Not Collaborating - Show Request Prompt */}
          <div className="card mb-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Direct Messaging Coming Soon
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                In-app messaging is under development. Meanwhile, you can connect with {profile?.full_name} through:
              </p>

              <div className="space-y-3 max-w-md mx-auto">
                <Link
                  href={`/user/${params.userId}`}
                  className="block w-full btn-primary"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Send Collaboration Request
                  </div>
                </Link>

                <p className="text-sm text-gray-500">
                  Collaborating unlocks their contact information (email, phone, LinkedIn)
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">Why Collaborate?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Unlock their email, phone, and social media profiles</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>See all their professional keywords and interests</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Build your professional network on OpenPools</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
