'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const SHOWCASE_TYPES = [
  { value: 'project', label: 'Project', icon: '💻', color: '#E84499' },
  { value: 'certification', label: 'Certification', icon: '🎓', color: '#9333EA' },
  { value: 'research', label: 'Research', icon: '🔬', color: '#E84499' },
  { value: 'publication', label: 'Publication', icon: '📚', color: '#9333EA' },
  { value: 'talk', label: 'Talk', icon: '🎤', color: '#E84499' },
  { value: 'course', label: 'Course', icon: '📖', color: '#9333EA' },
  { value: 'award', label: 'Award', icon: '🏆', color: '#F59E0B' },
  { value: 'patent', label: 'Patent', icon: '💡', color: '#E84499' }
]

export default function ShowcaseLightTheme({ profile, isOwnDNA = true }) {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [confetti, setConfetti] = useState(false)
  const [showCount, setShowCount] = useState(6)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    if (profile?.id) {
      loadShowcaseItems()
    }
  }, [profile])

  const loadShowcaseItems = async () => {
    try {
      const response = await fetch(`/api/showcase?user_id=${profile.id}`)
      const data = await response.json()

      if (data.items) {
        setItems(data.items)
      }
    } catch (error) {
      console.error('Error loading showcase items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (itemData) => {
    try {
      const response = await fetch('/api/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to add item')
        return false
      }

      setItems([data.item, ...items])
      setShowAddModal(false)

      // Show confetti celebration!
      setConfetti(true)
      setTimeout(() => setConfetti(false), 3000)

      return true
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
      return false
    }
  }

  const handleUpdateItem = async (itemId, updates) => {
    try {
      const response = await fetch(`/api/showcase/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to update item')
        return false
      }

      setItems(items.map(item => item.id === itemId ? data.item : item))
      setEditingItem(null)
      return true
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
      return false
    }
  }

  const handleTogglePin = async (item) => {
    const newPinned = !item.pinned

    if (newPinned) {
      const pinnedCount = items.filter(i => i.pinned && i.id !== item.id).length
      if (pinnedCount >= 3) {
        alert('You can only pin up to 3 items for your certificate')
        return
      }
    }

    await handleUpdateItem(item.id, { pinned: newPinned })
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/showcase/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        alert('Failed to delete item')
        return
      }

      setItems(items.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const getTypeConfig = (type) => {
    return SHOWCASE_TYPES.find(t => t.value === type) || SHOWCASE_TYPES[0]
  }

  const formatDateRange = (start_date, end_date, is_present) => {
    if (!start_date) return ''

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }

    const start = formatDate(start_date)

    if (is_present) {
      return `${start} - Present`
    } else if (end_date) {
      return `${start} - ${formatDate(end_date)}`
    } else {
      return start
    }
  }

  // Personalized text
  const firstName = profile?.full_name?.split(' ')[0] || 'their'
  const sectionTitle = isOwnDNA ? 'Your Showcase' : `${firstName}'s Showcase`
  const emptyMessage = isOwnDNA
    ? 'Start showcasing your achievements'
    : `${firstName} hasn't added any showcase items yet`

  // Pagination
  const pinnedItems = items.filter(item => item.pinned)
  const unpinnedItems = items.filter(item => !item.pinned)
  const visibleUnpinnedItems = unpinnedItems.slice(0, showCount)
  const hasMore = unpinnedItems.length > showCount

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-500">Loading showcase...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Confetti celebration */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                backgroundColor: ['#E84499', '#9333EA', '#FF6B9D', '#C026D3', '#F59E0B'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {sectionTitle}
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {isOwnDNA
              ? 'Curate your professional highlights. Pin up to 3 items for your DNA certificate.'
              : `Explore ${firstName}'s professional highlights and achievements`}
          </p>
        </div>

        {/* Pinned Items Section */}
        {pinnedItems.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 rounded-full border border-primary-200">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">Featured on DNA</span>
                <span className="text-xs text-gray-600">({pinnedItems.length}/3)</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedItems.map((item, index) => (
                <ShowcaseCardLight
                  key={item.id}
                  item={item}
                  typeConfig={getTypeConfig(item.type)}
                  formatDateRange={formatDateRange}
                  isOwnDNA={isOwnDNA}
                  onTogglePin={handleTogglePin}
                  onEdit={() => setEditingItem(item)}
                  onDelete={handleDeleteItem}
                  index={index}
                  mounted={mounted}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Items Grid */}
        {visibleUnpinnedItems.length > 0 && (
          <>
            {pinnedItems.length > 0 && (
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-sm text-gray-600 uppercase tracking-wider">All Achievements</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {visibleUnpinnedItems.map((item, index) => (
                <ShowcaseCardLight
                  key={item.id}
                  item={item}
                  typeConfig={getTypeConfig(item.type)}
                  formatDateRange={formatDateRange}
                  isOwnDNA={isOwnDNA}
                  onTogglePin={handleTogglePin}
                  onEdit={() => setEditingItem(item)}
                  onDelete={handleDeleteItem}
                  index={index + pinnedItems.length}
                  mounted={mounted}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => setShowCount(showCount + 6)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-primary-400 text-gray-900 font-medium rounded-xl transition-all"
                >
                  <span>Load {Math.min(6, unpinnedItems.length - showCount)} More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <div className={`text-center py-20 transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center border border-primary-200">
                <svg className="w-16 h-16 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{emptyMessage}</h3>
            {isOwnDNA && (
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Highlight your best work, achievements, and professional milestones
              </p>
            )}
          </div>
        )}

        {/* Add Button */}
        {isOwnDNA && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAddModal(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add to Showcase</span>
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modals */}
      {showAddModal && (
        <ShowcaseModalLight
          mode="add"
          types={SHOWCASE_TYPES}
          onSave={handleAddItem}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingItem && (
        <ShowcaseModalLight
          mode="edit"
          item={editingItem}
          types={SHOWCASE_TYPES}
          onSave={(data) => handleUpdateItem(editingItem.id, data)}
          onClose={() => setEditingItem(null)}
        />
      )}

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </section>
  )
}

// Light Theme Showcase Card Component
function ShowcaseCardLight({ item, typeConfig, formatDateRange, isOwnDNA, onTogglePin, onEdit, onDelete, index, mounted }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className={`group relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl shadow-sm hover:shadow-primary-100 transition-all duration-300 overflow-hidden">
        {/* Pin Badge */}
        {item.pinned && (
          <div className="absolute top-4 right-4 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 blur-lg opacity-40"></div>
              <div className="relative px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-200">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold text-white">PINNED</span>
              </div>
            </div>
          </div>
        )}

        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {item.image_url && !imageError ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-primary-100 to-purple-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{typeConfig.icon}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40"></div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Type Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full border border-primary-200">
              <span className="text-sm">{typeConfig.icon}</span>
              <span className="text-xs font-semibold text-primary-700">{typeConfig.label}</span>
            </div>

            {/* Date */}
            {item.start_date && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDateRange(item.start_date, item.end_date, item.is_present)}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
              {item.description}
            </p>
          )}

          {/* Links */}
          {item.links && item.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.links.slice(0, 3).map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary-100 border border-gray-300 hover:border-primary-300 rounded-lg text-xs text-gray-700 hover:text-primary-700 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{link.label}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
              {item.links.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-600">
                  +{item.links.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-md border border-primary-200">
                  {tag}
                </span>
              ))}
              {item.tags.length > 4 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                  +{item.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {isOwnDNA && (
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => onTogglePin(item)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-primary-400 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-700 transition-all"
              >
                <svg className="w-4 h-4" fill={item.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="hidden sm:inline">{item.pinned ? 'Unpin' : 'Pin'}</span>
              </button>
              <button
                onClick={() => onEdit(item)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-100 hover:bg-primary-200 border border-primary-300 hover:border-primary-400 rounded-lg text-sm font-medium text-primary-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-3 py-2.5 bg-red-100 hover:bg-red-200 border border-red-300 hover:border-red-400 rounded-lg text-red-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Light Theme Modal Component
function ShowcaseModalLight({ mode = 'add', item = null, types, onSave, onClose }) {
  const [formData, setFormData] = useState({
    type: item?.type || 'project',
    title: item?.title || '',
    description: item?.description || '',
    links: item?.links || [],
    image_url: item?.image_url || '',
    start_date: item?.start_date || '',
    end_date: item?.end_date || '',
    is_present: item?.is_present || false,
    tags: item?.tags || [],
    visible: item?.visible ?? true,
    pinned: item?.pinned || false
  })

  useEffect(() => {
    if (mode === 'edit' && item) {
    }
  }, [mode, item])

  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(item?.image_url || null)

  const handleImageUpload = async (file) => {
    if (!file) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Only JPEG, PNG, WebP, and GIF images are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/showcase/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to upload image')
        return
      }

      setFormData(prev => ({ ...prev, image_url: data.url }))
      setImagePreview(data.url)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = 'End date cannot be before start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    const success = await onSave(formData)
    setSaving(false)

    if (success) {
      onClose()
    }
  }

  const addLink = () => {
    if (newLink.label && newLink.url) {
      setFormData({
        ...formData,
        links: [...formData.links, newLink]
      })
      setNewLink({ label: '', url: '' })
    }
  }

  const removeLink = (index) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full my-8 border border-gray-200 shadow-2xl animate-modal-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {mode === 'add' ? 'Add to Showcase' : 'Edit Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 transition-all text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-primary-600">•</span>
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {types.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    formData.type === type.value
                      ? 'border-primary-400 bg-gradient-to-br from-primary-100 to-purple-100 shadow-lg shadow-primary-100'
                      : 'border-gray-300 bg-gray-50 hover:border-primary-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className={`text-xs font-medium ${formData.type === type.value ? 'text-primary-700' : 'text-gray-600'}`}>{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-primary-600">•</span>
              Title <span className="text-primary-600 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., AI-Powered Analytics Dashboard"
              className={`w-full px-4 py-3 bg-white border ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-primary-100`}
            />
            {errors.title && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.title}
            </p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-primary-600">•</span>
              Description <span className="text-xs text-gray-600 font-normal ml-1">(optional, max 500 chars)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
              placeholder="Brief description of your achievement..."
              rows={4}
              className={`w-full px-4 py-3 bg-white border ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-primary-100 resize-none`}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.description && <p className="text-red-600 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </p>}
              <p className={`text-xs ${formData.description.length > 450 ? 'text-primary-600' : 'text-gray-500'} ml-auto font-medium`}>
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-primary-600">•</span>
              Links
            </label>
            <div className="space-y-2">
              {formData.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-300">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary-300">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 font-medium">{link.label}</div>
                      <div className="text-xs text-gray-600 truncate">{link.url}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLink(index)}
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-all border border-transparent hover:border-red-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add Link Form */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  placeholder="Label (e.g., GitHub)"
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all duration-300 focus:shadow-lg focus:shadow-primary-100"
                />
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all duration-300 focus:shadow-lg focus:shadow-primary-100"
                />
                <button
                  onClick={addLink}
                  disabled={!newLink.label || !newLink.url}
                  className="px-4 py-2.5 bg-gradient-to-r from-primary-100 to-purple-100 hover:from-primary-200 hover:to-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-primary-700 text-sm font-semibold rounded-xl transition-all border border-primary-300 hover:border-primary-400 disabled:border-primary-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-primary-600">•</span>
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-primary-500 transition-all duration-300 focus:shadow-lg focus:shadow-primary-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-primary-600">•</span>
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value, is_present: false })}
                disabled={formData.is_present}
                className={`w-full px-4 py-3 bg-white border ${errors.end_date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'} rounded-xl text-gray-900 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-primary-100 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_present}
                    onChange={(e) => setFormData({ ...formData, is_present: e.target.checked, end_date: '' })}
                    className="w-4 h-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                  />
                </div>
                <span className="group-hover:text-gray-900 transition-colors">Currently working on this</span>
              </label>
              {errors.end_date && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.end_date}
              </p>}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-primary-600">•</span>
              Project Image <span className="text-xs text-gray-600 font-normal ml-1">(optional)</span>
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-300">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => {
                    setImagePreview(null)
                    setFormData(prev => ({ ...prev, image_url: '' }))
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className={`px-6 py-8 bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-dashed ${uploading ? 'border-primary-400 opacity-60' : 'border-primary-300 hover:border-primary-500'} rounded-xl transition-all text-center`}>
                {uploading ? (
                  <>
                    <svg className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="text-sm text-gray-700 font-medium">Uploading...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-900 font-semibold">Click to upload or drag image</p>
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG, WebP up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Or Paste URL */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-2">Or paste image URL:</p>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value })
                  if (e.target.value) setImagePreview(e.target.value)
                }}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all duration-300 focus:shadow-lg focus:shadow-primary-100"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 px-6 py-5 flex gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="group flex-1 px-5 py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 hover:scale-[1.02] disabled:hover:scale-100 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>{mode === 'add' ? 'Add to Showcase' : 'Save Changes'}</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}
