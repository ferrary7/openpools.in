'use client'

import { useState } from 'react'
import { downloadSlides } from './utils/downloadCards'

export default function CardsDownloadModal({ 
  isOpen, 
  onClose
}) {
  const [selectedSlides, setSelectedSlides] = useState({
    'hero': true,
    'percentile': false,
    'careerJobs': false,
    'careerSkills': false,
    'johari': false,
    'roadmap': false,
    'synergies': false,
    'showcase': false
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(0)

  // Map slide keys to their actual slide IDs
  const slidesMap = {
    'hero': 'slide-hero',
    'percentile': 'slide-percentile-0',
    'careerJobs': 'slide-career-skills-0',
    'careerSkills': 'slide-career-skills-1',
    'johari': 'slide-skill-insights-0',
    'roadmap': 'slide-skill-insights-1',
    'synergies': 'slide-skill-insights-2',
    'showcase': 'slide-showcase'
  }

  const slides = [
    { 
      id: 'hero', 
      label: 'Professional DNA Intro', 
      description: 'Your DNA helix visualization' 
    },
    { 
      id: 'percentile', 
      label: 'Skills Percentile', 
      description: 'Where you stand among professionals' 
    },
    { 
      id: 'careerJobs', 
      label: 'Job Opportunities', 
      description: 'Jobs that align with your skills' 
    },
    { 
      id: 'careerSkills', 
      label: 'Top 5 Skills', 
      description: 'Your most valued professional skills' 
    },
    { 
      id: 'johari', 
      label: 'Johari Window', 
      description: 'Skills known to you and others' 
    },
    { 
      id: 'roadmap', 
      label: 'Skill Roadmap', 
      description: 'Path to developing new skills' 
    },
    { 
      id: 'synergies', 
      label: 'Skill Synergies', 
      description: 'Powerful skill combinations' 
    },
    { 
      id: 'showcase', 
      label: 'Showcase', 
      description: 'All your projects & work' 
    }
  ]

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  const shareMessages = [
    `Just downloaded my Professional DNA insights from OpenPools! Check out my career analysis and skill breakdown: ${shareUrl}`,
    `Sharing my AI-analyzed Professional DNA from OpenPools - discover my skill percentiles, career opportunities, and expertise map: ${shareUrl}`,
    `My professional journey visualized through OpenPools DNA analysis - insights into my top skills and career trajectory: ${shareUrl}`,
    `Excited to share my Professional DNA insights! See my skill synergies, roadmap, and what opportunities align with my expertise: ${shareUrl}`
  ]

  const showNotification = (message) => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce'
    notification.innerHTML = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  const handleLinkedInShare = () => {
    const message = shareMessages[selectedMessage]
    navigator.clipboard.writeText(message).then(() => {
      showNotification('✓ Message copied! Paste it in LinkedIn')
    })

    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedinUrl, '_blank', 'width=600,height=600')
    
    // Also trigger the download
    handleDownload()
  }

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedSlides).every(v => v)
    const newState = {}
    slides.forEach(slide => {
      newState[slide.id] = !allSelected
    })
    setSelectedSlides(newState)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const selectedIds = Object.entries(selectedSlides)
        .filter(([_, checked]) => checked)
        .flatMap(([key, _]) => {
          if (key === 'showcase') {
            // For showcase, download all slides
            const showcaseContainer = document.getElementById('slide-showcase')
            if (!showcaseContainer) return []
            
            // Find the indicator dots container (flex gap-2 with buttons)
            // and count how many project slides exist
            const allButtons = showcaseContainer.querySelectorAll('div[class*="flex"][class*="gap-2"] button')
            
            // Filter buttons that look like indicators (small rounded pills at bottom)
            let slideCount = 0
            allButtons.forEach(btn => {
              const classList = btn.className
              // Indicators are small pills with rounded-full
              if (classList.includes('rounded-full') && classList.includes('w-2')) {
                slideCount++
              }
            })
            
            // Generate slide IDs for all showcase slides
            return slideCount > 0 ? Array.from({ length: slideCount }, (_, i) => `slide-showcase-${i}`) : []
          }
          return [slidesMap[key]]
        })
      
      await downloadSlides(selectedIds)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download slides')
    } finally {
      setIsDownloading(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] md:max-h-none bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">Download Insights</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Select the insights you want to export as high-quality images</p>
        </div>

        {/* Content - Scrollable on mobile */}
        <div className="px-4 md:px-8 py-4 md:py-6 overflow-y-auto flex-1">
          {/* Select All Button */}
          <button
            onClick={handleSelectAll}
            className="mb-3 text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            {Object.values(selectedSlides).every(v => v) ? 'Deselect All' : 'Select All'}
          </button>

          {/* Grid of checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {slides.map(slide => (
              <label 
                key={slide.id} 
                className="flex items-start gap-2 md:gap-3 p-2.5 md:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <input
                  type="checkbox"
                  checked={selectedSlides[slide.id]}
                  onChange={(e) => setSelectedSlides(prev => ({
                    ...prev,
                    [slide.id]: e.target.checked
                  }))}
                  className="mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded cursor-pointer flex-shrink-0 accent-primary-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{slide.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{slide.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 md:px-8 py-3 md:py-4 bg-gray-50 flex-shrink-0">
          {!showShareOptions ? (
            <div className="flex gap-2 md:gap-3 flex-col md:flex-row">
              <button
                onClick={onClose}
                disabled={isDownloading}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg bg-white text-gray-900 text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50 order-2 md:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading || !Object.values(selectedSlides).some(v => v)}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs md:text-sm font-medium transition-colors disabled:opacity-50 disabled:bg-primary-400 order-1 md:order-2"
              >
                {isDownloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Exporting...
                  </span>
                ) : (
                  'Export'
                )}
              </button>
              <button
                onClick={() => setShowShareOptions(true)}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium transition-colors"
              >
                Share on LinkedIn
              </button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Select message to share:</label>
                <select
                  value={selectedMessage}
                  onChange={(e) => setSelectedMessage(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm text-gray-900 bg-white focus:outline-none focus:border-primary-500"
                >
                  {shareMessages.map((msg, idx) => (
                    <option key={idx} value={idx} className="text-gray-900">
                      Message {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-600 bg-gray-100 p-2.5 md:p-3 rounded-lg italic line-clamp-3 md:line-clamp-none">
                {shareMessages[selectedMessage]}
              </p>
              <div className="flex gap-2 md:gap-3 flex-col">
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="px-4 py-2 md:py-2.5 rounded-lg bg-white text-gray-900 text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleLinkedInShare}
                  className="px-4 py-2 md:py-2.5 rounded-lg bg-[#0077B5] hover:bg-[#005885] text-white text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Share on LinkedIn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
