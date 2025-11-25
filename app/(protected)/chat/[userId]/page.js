'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PremiumChatPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)
  const emojiPickerRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [collabId, setCollabId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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

  // Poll for new messages
  useEffect(() => {
    if (isCollaborating) {
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [isCollaborating, params.userId])

  // Auto-scroll to bottom only when user sends a message
  const lastMessageCount = useRef(messages.length)
  useEffect(() => {
    if (messages.length > lastMessageCount.current) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.sender_id === currentUserId) {
        scrollToBottom(true)
      }
    }
    lastMessageCount.current = messages.length
  }, [messages, currentUserId])

  // Simulate online status
  useEffect(() => {
    setIsOnline(Math.random() > 0.3)
  }, [])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }, 100)
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${params.userId}`)
      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setIsCollaborating(data.isCollaborating || false)
        setCollabId(data.collabStatus?.collabId || null)
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
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: message.trim(),
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      status: 'sending'
    }

    setMessages(prev => [...prev, tempMessage])
    const messageToSend = message.trim()
    setMessage('')

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: params.userId,
          content: messageToSend
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to send message')

      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? { ...data.message, status: 'sent' } : msg
      ))
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages(prev => prev.map(msg =>
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      ))
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const shouldShowDateDivider = (currentMsg, previousMsg) => {
    if (!previousMsg) return true
    const currentDate = new Date(currentMsg.created_at).toDateString()
    const previousDate = new Date(previousMsg.created_at).toDateString()
    return currentDate !== previousDate
  }

  const shouldGroupMessage = (currentMsg, previousMsg) => {
    if (!previousMsg) return false
    if (currentMsg.sender_id !== previousMsg.sender_id) return false
    const timeDiff = new Date(currentMsg.created_at) - new Date(previousMsg.created_at)
    return timeDiff < 120000 // 2 minutes
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-purple-500 opacity-20 animate-ping"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading conversation...</p>
        </div>
      </div>
    )
  }

  const emojis = [
    '😊', '😂', '❤️', '🔥', '👍', '👏', '🎉', '💯',
    '😍', '🤔', '😎', '🙌', '💪', '✨', '🚀', '💡',
    '👀', '🤝', '💼', '📈', '🎯', '⚡', '🌟', '💖'
  ]

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-gradient-to-br from-gray-50 via-pink-50/20 to-purple-50/20">
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .message-bubble {
          animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-animate {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .input-glow:focus-within {
          box-shadow: 0 0 0 3px rgba(232, 68, 153, 0.1);
        }
      `}</style>

      {/* Fixed Header with glass effect */}
      <div className="flex-shrink-0 glass-effect border-b border-gray-200/50 px-6 py-4 shadow-sm header-animate">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </button>

            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white overflow-hidden">
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(profile?.full_name)
                )}
              </div>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">{profile?.full_name}</h1>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Active now
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Offline</span>
                )}
                {profile?.job_title && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-600 truncate">{profile.job_title}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      {isCollaborating ? (
        <>
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            <div className="max-w-4xl mx-auto space-y-1">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[60vh]">
                  <div className="text-center max-w-sm">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-200 to-purple-200 animate-pulse"></div>
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Start the conversation</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Send a message to {profile?.full_name?.split(' ')[0]} and start collaborating
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isSent = msg.sender_id === currentUserId
                    const previousMsg = index > 0 ? messages[index - 1] : null
                    const showDate = shouldShowDateDivider(msg, previousMsg)
                    const isGrouped = shouldGroupMessage(msg, previousMsg)

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-6">
                            <div className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50">
                              <p className="text-xs font-semibold text-gray-600">
                                {formatDate(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className={`flex gap-3 ${isSent ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
                          {!isSent && !isGrouped && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-md overflow-hidden">
                              {profile?.profile_picture_url ? (
                                <img
                                  src={profile.profile_picture_url}
                                  alt={profile.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getInitials(profile?.full_name)
                              )}
                            </div>
                          )}
                          {!isSent && isGrouped && <div className="w-8 flex-shrink-0"></div>}

                          <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%] sm:max-w-md message-bubble`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl ${
                                isSent
                                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                  : 'bg-white text-gray-900 shadow-md border border-gray-100'
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>

                            <div className={`flex items-center gap-1.5 mt-1 px-1 text-xs ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                              <p className="text-gray-500 font-medium">
                                {formatTime(msg.created_at)}
                              </p>
                              {isSent && (
                                <span>
                                  {msg.status === 'sending' && (
                                    <span className="text-gray-400">○</span>
                                  )}
                                  {(msg.status === 'sent' || !msg.status) && (
                                    <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  {msg.status === 'failed' && (
                                    <span className="text-red-500" title="Failed to send">!</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 mt-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-semibold text-xs shadow-md overflow-hidden">
                        {profile?.profile_picture_url ? (
                          <img
                            src={profile.profile_picture_url}
                            alt={profile.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(profile?.full_name)
                        )}
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-md px-5 py-3 shadow-md border border-gray-100">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Fixed Input Area */}
          <div className="flex-shrink-0 glass-effect border-t border-gray-200/50 px-6 py-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1 relative input-glow rounded-full transition-shadow duration-200">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    placeholder={`Message ${profile?.full_name?.split(' ')[0]}...`}
                    className="w-full pl-5 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary-300 transition-all duration-200 text-sm placeholder-gray-400 shadow-sm"
                  />

                  {/* Emoji Picker */}
                  <div ref={emojiPickerRef} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 w-64 z-50" style={{ animation: 'slideInUp 0.2s ease-out' }}>
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-700">Pick an emoji</p>
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleEmojiSelect(emoji)}
                              className="text-2xl hover:bg-gray-100 rounded-lg p-1.5 transition-colors active:scale-95 transform"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!message.trim() || sending}
                  className={`flex-shrink-0 p-3.5 rounded-full transition-all duration-300 transform ${
                    message.trim() && !sending
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 hover:scale-105 active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {sending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-200 to-purple-200 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Start Collaborating
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Send a collaboration request to unlock messaging with {profile?.full_name}
            </p>
            <Link
              href={`/user/${params.userId}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Send Request
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
