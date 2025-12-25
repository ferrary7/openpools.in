'use client'

import { useState, useEffect, useRef } from 'react'
import { getPossessiveName, getSubjectPronoun } from './utils/pronouns'
import HeroSlide from './slides/HeroSlide'
import PercentileSlide from './slides/PercentileSlide'
import CareerSkillsSlide from './slides/CareerSkillsSlide'
import CardsDownloadModal from './CardsDownloadModal'
import DNAHelixCanvas from './DNAHelixCanvas'

// Image component with error handling
function ProjectImageWithFallback({ src, alt }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="relative h-48 md:h-64 lg:h-80 w-full overflow-hidden bg-gradient-to-br from-primary-500/20 to-purple-500/20">
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2">📁</div>
            <p className="text-sm text-gray-400">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DNAWrap({ profile, keywordProfile, showcaseItems = [], isOwnDNA = true }) {
  const [visibleSections, setVisibleSections] = useState(new Set([0])) // Initialize with first section visible
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState(0) // Track the primary visible section
  const [metrics, setMetrics] = useState(null)
  const [horizontalSlides, setHorizontalSlides] = useState({}) // Track active slide per section
  const [aiInsights, setAiInsights] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [localShowcaseItems, setLocalShowcaseItems] = useState(showcaseItems)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const sectionsRef = useRef([])
  const refreshIntervalRef = useRef(null)

  // Auto-refresh showcase items every 5 seconds
  useEffect(() => {
    const refreshShowcaseItems = async () => {
      if (!profile?.id) return
      try {
        const response = await fetch(`/api/showcase?user_id=${profile.id}`)
        const data = await response.json()
        if (data.items) {
          setLocalShowcaseItems(data.items)
        }
      } catch (error) {
        console.error('Error refreshing showcase items:', error)
      }
    }

    if (profile?.id) {
      // Refresh immediately on mount
      refreshShowcaseItems()
      
      // Then refresh every 5 seconds
      refreshIntervalRef.current = setInterval(refreshShowcaseItems, 5000)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [profile?.id])

  // Fetch real metrics from database
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/dna-metrics?user_id=${profile.id}`)
        const data = await response.json()
        setMetrics(data.userMetrics)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    if (profile?.id) {
      fetchMetrics()
    }
  }, [profile?.id])

  // Fetch AI insights - first from database, then generate if needed
  useEffect(() => {
    const fetchAiInsights = async () => {
      if (!profile?.id || !keywordProfile?.keywords || !metrics) return

      const CACHE_VERSION = 'v4' // Increment to invalidate old caches when prompts change
      const CACHE_KEY = `ai_insights_${CACHE_VERSION}_${profile.id}`
      const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

      try {
        // Generate hash of current skills to detect changes
        const skills = keywordProfile.keywords.slice(0, 15).map(k =>
          typeof k === 'string' ? k : k.keyword || k.name || ''
        )
        const skillsHash = btoa(skills.sort().join(','))

        // Check localStorage first (fastest)
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp, hash, version } = JSON.parse(cached)
          const age = Date.now() - timestamp

          // Use cache if fresh, skills unchanged, and version matches
          if (age < CACHE_DURATION && hash === skillsHash && version === CACHE_VERSION) {
            setAiInsights(data)
            return
          }
        }

        // Try to fetch from database (shared across users)
        setAiLoading(true)
        const dbResponse = await fetch(`/api/ai-insights?userId=${profile.id}`)

        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          if (dbData.exists) {
            console.log('Using database insights for', profile.id)
            setAiInsights(dbData)

            // Cache in localStorage for faster future loads
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: dbData,
              timestamp: Date.now(),
              hash: skillsHash,
              version: CACHE_VERSION
            }))
            setAiLoading(false)
            return
          }
        }

        // Database miss - generate new insights (will be stored in DB by API)
        console.log('Generating fresh insights for', profile.id)
        const response = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            skills,
            signalClassification: metrics.signalClassification,
            complementarySkills: metrics.complementarySkills
          })
        })

        if (!response.ok) throw new Error('Failed to fetch AI insights')

        const data = await response.json()
        setAiInsights(data)

        // Cache the result with version
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now(),
          hash: skillsHash,
          version: CACHE_VERSION
        }))
      } catch (error) {
        console.error('Error fetching AI insights:', error)
      } finally {
        setAiLoading(false)
      }
    }

    fetchAiInsights()
  }, [profile?.id, keywordProfile?.keywords, metrics])

  // Calculate basic stats
  const totalMarkers = keywordProfile?.total_keywords || 0
  const dnaCode = profile
    ? `DNA-${profile.id.slice(0, 3).toUpperCase()}-${totalMarkers}K`
    : 'DNA-XXX-0K'

  const topSkills = keywordProfile?.keywords?.slice(0, 5) || []

  // Horizontal slide navigation
  const navigateHorizontal = (sectionId, direction, totalSlides) => {
    setHorizontalSlides(prev => {
      const currentSlide = prev[sectionId] || 0
      let newSlide = currentSlide + direction

      // Validate totalSlides
      const validTotalSlides = Math.max(1, totalSlides || 1)
      
      // Loop around
      if (newSlide < 0) newSlide = validTotalSlides - 1
      if (newSlide >= validTotalSlides) newSlide = 0

      return { ...prev, [sectionId]: newSlide }
    })
  }

  // Intersection Observer for scroll animations and section tracking
  useEffect(() => {
    const observers = sectionsRef.current.map((section, index) => {
      if (!section) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set([...prev, index]))
              // Update current section when it enters viewport
              setCurrentSection(index)
            }
          })
        },
        {
          threshold: 0.3,
          rootMargin: '0px'
        }
      )

      observer.observe(section)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [metrics])

  // Track scroll progress and update active section
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const progress = (scrolled / documentHeight) * 100
      setScrollProgress(Math.min(progress, 100))

      // Update current section based on scroll position
      let closestSection = 0
      let closestDistance = Infinity

      sectionsRef.current.forEach((section, index) => {
        if (!section) return
        const rect = section.getBoundingClientRect()
        const distance = Math.abs(rect.top - windowHeight / 2)
        
        if (distance < closestDistance) {
          closestDistance = distance
          closestSection = index
        }
      })

      setCurrentSection(closestSection)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!metrics) {
    // DNA helix loading animation
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden relative">
        <div className="animate-dna-pan rotate-90">
          <DNAHelixCanvas keywords={[""]} className="opacity-60"/>
        </div>
        <p className="text-gray-400 text-lg md:text-xl font-semibold mt-8">
          DNA loading...
        </p>
      </div>
    )
  }

  const sections = [
    // Section 1: Hero
    {
      id: 'hero',
      content: (isVisible) => (
        <HeroSlide
          isVisible={isVisible}
          profile={profile}
          keywordProfile={keywordProfile}
          totalMarkers={totalMarkers}
          dnaCode={dnaCode}
          daysActive={metrics.daysActive}
        />
      )
    },

    // Section 2: Percentile
    {
      id: 'percentile',
      content: (isVisible) => (
        <PercentileSlide
          isVisible={isVisible}
          isOwnDNA={isOwnDNA}
          profile={profile}
          metrics={metrics}
          totalMarkers={totalMarkers}
          currentSlide={horizontalSlides['percentile'] || 0}
          onNavigate={(dir, totalSlides) => navigateHorizontal('percentile', dir, totalSlides)}
          onSlideChange={(idx) => setHorizontalSlides(prev => ({ ...prev, percentile: idx }))}
        />
      )
    },

    // Section 3: Career & Skills
    {
      id: 'career-skills',
      content: (isVisible) => (
        <CareerSkillsSlide
          isVisible={isVisible}
          isOwnDNA={isOwnDNA}
          profile={profile}
          topSkills={topSkills}
          aiInsights={aiInsights}
          aiLoading={aiLoading}
          currentSlide={horizontalSlides['career-skills'] || 0}
          onNavigate={(dir, totalSlides) => navigateHorizontal('career-skills', dir, totalSlides)}
          onSlideChange={(idx) => setHorizontalSlides(prev => ({ ...prev, 'career-skills': idx }))}
        />
      )
    },

    // Section 4: Skill Insights (Johari Window + Roadmap + Power Combos)
    {
      id: 'skill-insights',
      content: (isVisible) => {
        const currentSlide = horizontalSlides['skill-insights'] || 0

        const slides = [
          // Slide 1: Johari Window
          {
            title: `${getPossessiveName(isOwnDNA, profile?.full_name)} Professional Johari Window`,
            content: aiLoading ? (
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full border-2 border-t-primary-500 animate-spin"></div>
                <p className="text-gray-400 text-sm md:text-base">Mapping skill quadrants...</p>
              </div>
            ) : aiInsights?.johariWindow ? (
              <div className="w-full max-w-7xl mx-auto relative px-3 sm:px-4 md:px-6">
                {/* Modern Card Grid - 4 Compact Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                  {/* OPEN ARENA - Modern Card */}
                  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500/10 via-[#0A0A0A] to-[#0A0A0A] border-2 border-primary-500/20 hover:border-primary-500/40 transition-all duration-500 hover:scale-[1.02] shadow-2xl shadow-primary-500/10 opacity-0 animate-slideIn" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/30 rounded-full blur-3xl"></div>

                    {/* Decorative geometric icon - partial visibility (1/4th) */}
                    <div className="absolute -bottom-20 -right-20 sm:-bottom-30 sm:-right-30md:-bottom-23 md:-right-23 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 opacity-15 pointer-events-none">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="35" stroke="url(#primary-gradient)" strokeWidth="3" fill="none"/>
                        <circle cx="50" cy="50" r="25" stroke="url(#primary-gradient)" strokeWidth="2" fill="none"/>
                        <circle cx="50" cy="50" r="15" fill="url(#primary-gradient)" fillOpacity="0.3"/>
                        <defs>
                          <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e84499" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="relative p-3 sm:p-4 md:p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 md:mb-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl md:text-3xl font-black text-white mb-0 sm:mb-1 line-clamp-1">Open Arena</h3>
                          <p className="text-[9px] sm:text-xs md:text-sm text-primary-400 font-semibold uppercase tracking-wider line-clamp-1">Public Knowledge</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-br from-primary-400 to-primary-600 bg-clip-text text-transparent leading-none">
                            {(Array.isArray(aiInsights.johariWindow.open) ? aiInsights.johariWindow.open : []).length}
                          </div>
                          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium mt-0.5 whitespace-nowrap">skills</span>
                        </div>
                      </div>

                      {/* Skills List */}
                      <div className="space-y-1 sm:space-y-2">
                        {(Array.isArray(aiInsights.johariWindow.open) ? aiInsights.johariWindow.open : []).map((skill, i) => (
                          <div key={i} className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 py-0.5 sm:py-1 transition-all duration-300 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}>
                            <div className="w-1 sm:w-2 md:w-2.5 h-1 sm:h-2 md:h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex-shrink-0 group-hover/skill:scale-125 transition-transform shadow-lg shadow-primary-500/50"></div>
                            <span className="text-xs sm:text-base md:text-lg text-gray-200 group-hover/skill:text-white transition-colors font-medium truncate">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BLIND SPOT - Modern Card */}
                  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 via-[#0A0A0A] to-[#0A0A0A] border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.02] shadow-2xl shadow-purple-500/10 opacity-0 animate-slideIn" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"></div>

                    {/* Decorative geometric icon - partial visibility (1/4th) */}
                    <div className="absolute -bottom-20 -right-20 sm:-bottom-30 sm:-right-30md:-bottom-23 md:-right-23 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 opacity-15 pointer-events-none">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="25" height="25" stroke="url(#purple-gradient)" strokeWidth="2.5" rx="3"/>
                        <rect x="55" y="20" width="25" height="25" stroke="url(#purple-gradient)" strokeWidth="2.5" rx="3"/>
                        <rect x="20" y="55" width="25" height="25" stroke="url(#purple-gradient)" strokeWidth="2.5" rx="3"/>
                        <rect x="55" y="55" width="25" height="25" fill="url(#purple-gradient)" fillOpacity="0.3" rx="3"/>
                        <defs>
                          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="relative p-3 sm:p-4 md:p-6">
                      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 md:mb-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl md:text-3xl font-black text-white mb-0 sm:mb-1 line-clamp-1">Blind Spot</h3>
                          <p className="text-[9px] sm:text-xs md:text-sm text-purple-400 font-semibold uppercase tracking-wider line-clamp-1">Others See This</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent leading-none">
                            {(Array.isArray(aiInsights.johariWindow.blind) ? aiInsights.johariWindow.blind : []).length}
                          </div>
                          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium mt-0.5 whitespace-nowrap">skills</span>
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        {(Array.isArray(aiInsights.johariWindow.blind) ? aiInsights.johariWindow.blind : []).map((skill, i) => (
                          <div key={i} className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 py-0.5 sm:py-1 transition-all duration-300 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}>
                            <div className="w-1 sm:w-2 md:w-2.5 h-1 sm:h-2 md:h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex-shrink-0 group-hover/skill:scale-125 transition-transform shadow-lg shadow-purple-500/50"></div>
                            <span className="text-xs sm:text-base md:text-lg text-gray-200 group-hover/skill:text-white transition-colors font-medium truncate">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* HIDDEN FACADE - Modern Card */}
                  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-[#0A0A0A] to-[#0A0A0A] border-2 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-500 hover:scale-[1.02] shadow-2xl shadow-indigo-500/10 opacity-0 animate-slideIn" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>

                    {/* Decorative geometric icon - partial visibility (1/4th) */}
                    <div className="absolute -bottom-20 -right-20 sm:-bottom-30 sm:-right-30md:-bottom-23 md:-right-23 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 opacity-15 pointer-events-none">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 20 L65 35 L65 65 L50 80 L35 65 L35 35 Z" stroke="url(#indigo-gradient)" strokeWidth="2.5" fill="none"/>
                        <path d="M50 30 L60 40 L60 60 L50 70 L40 60 L40 40 Z" stroke="url(#indigo-gradient)" strokeWidth="2" fill="none"/>
                        <path d="M50 40 L55 45 L55 55 L50 60 L45 55 L45 45 Z" fill="url(#indigo-gradient)" fillOpacity="0.3"/>
                        <defs>
                          <linearGradient id="indigo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#4f46e5" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="relative p-3 sm:p-4 md:p-6">
                      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 md:mb-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl md:text-3xl font-black text-white mb-0 sm:mb-1 line-clamp-1">Hidden Facade</h3>
                          <p className="text-[9px] sm:text-xs md:text-sm text-indigo-400 font-semibold uppercase tracking-wider line-clamp-1">Private Knowledge</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-br from-indigo-400 to-indigo-600 bg-clip-text text-transparent leading-none">
                            {(Array.isArray(aiInsights.johariWindow.hidden) ? aiInsights.johariWindow.hidden : []).length}
                          </div>
                          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium mt-0.5 whitespace-nowrap">skills</span>
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        {(Array.isArray(aiInsights.johariWindow.hidden) ? aiInsights.johariWindow.hidden : []).map((skill, i) => (
                          <div key={i} className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 py-0.5 sm:py-1 transition-all duration-300 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}>
                            <div className="w-1 sm:w-2 md:w-2.5 h-1 sm:h-2 md:h-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex-shrink-0 group-hover/skill:scale-125 transition-transform shadow-lg shadow-indigo-500/50"></div>
                            <span className="text-xs sm:text-base md:text-lg text-gray-200 group-hover/skill:text-white transition-colors font-medium truncate">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* UNKNOWN - Modern Card */}
                  <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 via-[#0A0A0A] to-[#0A0A0A] border-2 border-pink-500/20 hover:border-pink-500/40 transition-all duration-500 hover:scale-[1.02] shadow-2xl shadow-pink-500/10 opacity-0 animate-slideIn" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl"></div>

                    {/* Decorative geometric icon - partial visibility (1/4th) */}
                    <div className="absolute -bottom-20 -right-20 sm:-bottom-30 sm:-right-30 md:-bottom-23 md:-right-23 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 opacity-15 pointer-events-none">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 15 L55 40 L80 45 L55 50 L50 75 L45 50 L20 45 L45 40 Z" stroke="url(#pink-gradient)" strokeWidth="2.5" fill="none"/>
                        <path d="M50 25 L53 42 L70 45 L53 48 L50 65 L47 48 L30 45 L47 42 Z" stroke="url(#pink-gradient)" strokeWidth="2" fill="none"/>
                        <circle cx="50" cy="45" r="8" fill="url(#pink-gradient)" fillOpacity="0.3"/>
                        <defs>
                          <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#e84499" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="relative p-3 sm:p-4 md:p-6">
                      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 md:mb-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-xl md:text-3xl font-black text-white mb-0 sm:mb-1 line-clamp-1">Unknown</h3>
                          <p className="text-[9px] sm:text-xs md:text-sm text-pink-400 font-semibold uppercase tracking-wider line-clamp-1">Undiscovered</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-br from-pink-400 to-pink-600 bg-clip-text text-transparent leading-none">
                            {(Array.isArray(aiInsights.johariWindow.unknown) ? aiInsights.johariWindow.unknown : []).length}
                          </div>
                          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium mt-0.5 whitespace-nowrap">skills</span>
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2">
                        {(Array.isArray(aiInsights.johariWindow.unknown) ? aiInsights.johariWindow.unknown : []).map((skill, i) => (
                          <div key={i} className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 py-0.5 sm:py-1 transition-all duration-300 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}>
                            <div className="w-1 sm:w-2 md:w-2.5 h-1 sm:h-2 md:h-2.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex-shrink-0 group-hover/skill:scale-125 transition-transform shadow-lg shadow-pink-500/50"></div>
                            <span className="text-xs sm:text-base md:text-lg text-gray-200 group-hover/skill:text-white transition-colors font-medium truncate">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-5xl md:text-6xl mb-4">🪟</div>
                <p className="text-sm md:text-base">Loading skill insights...</p>
              </div>
            ),
            detail: "Understanding what you know, what others see, and what's yet to be discovered"
          },
          // Slide 2: Skill Progression Roadmap
          {
            title: `${getPossessiveName(isOwnDNA, profile?.full_name)} Skill Progression Roadmap`,
            content: aiLoading ? (
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full border-2 border-t-primary-500 animate-spin"></div>
                <p className="text-gray-400 text-sm md:text-base">Building roadmap...</p>
              </div>
            ) : aiInsights?.skillGap?.targetRoles ? (
              <div className="max-w-4xl mx-auto relative px-3 sm:px-4">
                {/* Roadmap Path Line */}
                <div className="absolute left-4 sm:left-5 md:left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-purple-500 to-pink-500 opacity-30"></div>

                {/* Role Cards */}
                <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                  {aiInsights.skillGap.targetRoles.slice(0, 3).map((role, i) => (
                    <div
                      key={i}
                      className="relative opacity-0 animate-slideIn"
                      style={{ animationDelay: `${i * 200}ms`, animationFillMode: 'forwards' }}
                    >
                      {/* Roadmap Node */}
                      <div className="absolute left-1 sm:left-5 md:left-6 top-3 sm:top-4 md:top-6 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 border-2 md:border-3 border-[#0A0A0A] z-10">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 blur-md opacity-50 animate-pulse"></div>
                      </div>

                      {/* Card */}
                      <div className="ml-6 sm:ml-10 md:ml-20 group">
                        <div className="relative overflow-hidden rounded-lg sm:rounded-xl border border-white/15 bg-white/8 backdrop-blur-xl hover:border-white/25 transition-all duration-500">
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative p-2.5 sm:p-4 md:p-5">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1.5 sm:mb-3 md:mb-4">
                              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-1 min-w-0">
                                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-gradient-to-br from-primary-500/25 to-purple-500/25 border border-primary-500/40 flex items-center justify-center text-sm sm:text-lg md:text-xl flex-shrink-0">
                                  {i === 0 ? '🎯' : i === 1 ? '🚀' : '⭐'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white truncate">{role.role}</h3>
                                  <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-wide font-medium hidden sm:block">Career Target</p>
                                </div>
                              </div>

                              {/* Match Score */}
                              <div className="text-right ml-2 sm:ml-2 md:ml-4 flex-shrink-0">
                                <div className="text-xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-primary-400 to-purple-500 bg-clip-text text-transparent leading-none">
                                  {role.currentMatch}%
                                </div>
                                <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-wide mt-0.5 sm:mt-1 font-medium hidden sm:block">Ready</p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-2 sm:mb-3 md:mb-4">
                              <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2">
                                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-300 font-semibold">Skill Match</span>
                                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-medium">{100 - role.currentMatch}% to go</span>
                              </div>
                              <div className="relative h-1.5 sm:h-2 md:h-2.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-full transition-all duration-2000 ease-out"
                                  style={{
                                    width: isVisible ? `${role.currentMatch}%` : '0%',
                                    transitionDelay: `${i * 200 + 300}ms`
                                  }}
                                >
                                  {/* Shimmer effect */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                </div>
                                {/* Milestone markers */}
                                <div className="absolute inset-0 flex items-center justify-around px-1">
                                  {[25, 50, 75].map((mark) => (
                                    <div key={mark} className="w-px h-1 sm:h-1.5 md:h-2 bg-white/30"></div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Skills to Learn */}
                            <div>
                              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 mb-1.5 sm:mb-2 md:mb-2.5">
                                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-wider">Skills to Learn</span>
                                <div className="flex-1 h-px bg-white/15"></div>
                              </div>
                              <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                                {role.missingSkills.slice(0, 5).map((skill, idx) => (
                                  <div
                                    key={idx}
                                    className="group/skill px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-white/8 border border-white/15 hover:border-primary-500/50 rounded-md sm:rounded-lg text-[11px] sm:text-xs md:text-sm text-gray-200 hover:text-white transition-all duration-300 cursor-default font-medium"
                                  >
                                    <span className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5">
                                      <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary-400 opacity-70 group-hover/skill:opacity-100"></span>
                                      {skill}
                                    </span>
                                  </div>
                                ))}
                                {role.missingSkills.length > 5 && (
                                  <div className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-white/8 border border-white/15 rounded-md sm:rounded-lg text-[11px] sm:text-xs md:text-sm text-gray-400 font-medium">
                                    +{role.missingSkills.length - 5} more
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Corner accent */}
                          <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Info */}
                <div className="mt-3 sm:mt-4 md:mt-5 ml-8 sm:ml-10 md:ml-20 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-5 text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-medium">
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-500"></div>
                    <span>Current Progress</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-white/20"></div>
                    <span>Skills Needed</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-5xl md:text-6xl mb-4">🗺️</div>
                <p className="text-sm md:text-base">Loading roadmap...</p>
              </div>
            ),
            detail: "Prioritized learning paths based on current skills"
          },
          // Slide 3: Power Combos & Missing Links
          {
            title: "Skill Synergies & Opportunities",
            content: aiLoading ? (
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full border-2 border-t-primary-500 animate-spin"></div>
                <p className="text-gray-400 text-sm md:text-base">Finding combinations...</p>
              </div>
            ) : aiInsights?.smartCombinations ? (
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-3 sm:px-4 md:px-6">
                {/* Power Combos */}
                <div className="relative group">
                  {/* Animated background glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl rounded-2xl border-2 border-primary-500/20 p-3 sm:p-5 md:p-8">
                    {/* Header with icon */}
                    <div className="mb-3 sm:mb-4 md:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500/40 to-purple-500/40 border-2 border-primary-500/60 flex items-center justify-center text-lg sm:text-xl md:text-2xl flex-shrink-0 shadow-lg shadow-primary-500/20">
                          ⚡
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-2xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Power Combos</h3>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-0.5 line-clamp-1">Mastered together</p>
                        </div>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-primary-500/50 to-transparent rounded-full"></div>
                    </div>

                    {/* Combo Cards - Show 2 on mobile, 3 on desktop */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      {aiInsights.smartCombinations.powerCombos?.slice(0, 2).map((combo, i) => (
                        <div
                          key={i}
                          className="group/card relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-purple-500/5 hover:from-primary-500/20 hover:to-purple-500/15 backdrop-blur-xl transition-all duration-500 p-2.5 sm:p-3 md:p-5 opacity-0 animate-slideIn"
                          style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
                        >
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative">
                            <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary-500/30 to-purple-500/30 border border-primary-500/50 flex items-center justify-center text-xs sm:text-sm md:text-base flex-shrink-0 mt-0.5 group-hover/card:scale-110 transition-transform">
                                ✨
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm md:text-base font-bold text-primary-100 mb-0.5 sm:mb-1 md:mb-2 leading-tight group-hover/card:text-primary-50 transition-colors line-clamp-1">{combo.combo}</h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 leading-relaxed group-hover/card:text-gray-200 transition-colors line-clamp-2">{combo.impact}</p>
                              </div>
                            </div>
                          </div>

                          {/* Corner accent */}
                          <div className="absolute top-0 right-0 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-gradient-to-bl from-primary-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      ))}
                      {/* Show on desktop only */}
                      {aiInsights.smartCombinations.powerCombos?.[2] && (
                        <div
                          className="group/card relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-purple-500/5 hover:from-primary-500/20 hover:to-purple-500/15 backdrop-blur-xl transition-all duration-500 p-2.5 sm:p-3 md:p-5 opacity-0 animate-slideIn hidden md:block"
                          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative">
                            <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary-500/30 to-purple-500/30 border border-primary-500/50 flex items-center justify-center text-xs sm:text-sm md:text-base flex-shrink-0 mt-0.5 group-hover/card:scale-110 transition-transform">
                                ✨
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm md:text-base font-bold text-primary-100 mb-0.5 sm:mb-1 md:mb-2 leading-tight group-hover/card:text-primary-50 transition-colors line-clamp-1">{aiInsights.smartCombinations.powerCombos[2].combo}</h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 leading-relaxed group-hover/card:text-gray-200 transition-colors line-clamp-2">{aiInsights.smartCombinations.powerCombos[2].impact}</p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-gradient-to-bl from-primary-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Missing Links */}
                <div className="relative group">
                  {/* Animated background glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl rounded-2xl border-2 border-pink-500/20 p-3 sm:p-5 md:p-8">
                    {/* Header with icon */}
                    <div className="mb-3 sm:mb-4 md:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-500/40 to-purple-500/40 border-2 border-pink-500/60 flex items-center justify-center text-lg sm:text-xl md:text-2xl flex-shrink-0 shadow-lg shadow-pink-500/20">
                          🔗
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-2xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Missing Links</h3>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-0.5 line-clamp-1">Unlock opportunities</p>
                        </div>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-pink-500/50 to-transparent rounded-full"></div>
                    </div>

                    {/* Link Cards - Show 2 on mobile, 3 on desktop */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      {aiInsights.smartCombinations.missingLinks?.slice(0, 2).map((link, i) => (
                        <div
                          key={i}
                          className="group/card relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-purple-500/5 hover:from-pink-500/20 hover:to-purple-500/15 backdrop-blur-xl transition-all duration-500 p-2.5 sm:p-3 md:p-5 opacity-0 animate-slideIn"
                          style={{ animationDelay: `${i * 100 + 150}ms`, animationFillMode: 'forwards' }}
                        >
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative">
                            <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-pink-500/50 flex items-center justify-center text-xs sm:text-sm md:text-base flex-shrink-0 mt-0.5 group-hover/card:scale-110 transition-transform">
                                💡
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm md:text-base font-bold text-pink-100 mb-0.5 sm:mb-1 md:mb-2 leading-tight group-hover/card:text-pink-50 transition-colors line-clamp-1">{link.skill}</h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 leading-relaxed group-hover/card:text-gray-200 transition-colors line-clamp-2">{link.unlock}</p>
                              </div>
                            </div>
                          </div>

                          {/* Corner accent */}
                          <div className="absolute top-0 right-0 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-gradient-to-bl from-pink-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      ))}
                      {/* Show on desktop only */}
                      {aiInsights.smartCombinations.missingLinks?.[2] && (
                        <div
                          className="group/card relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-purple-500/5 hover:from-pink-500/20 hover:to-purple-500/15 backdrop-blur-xl transition-all duration-500 p-2.5 sm:p-3 md:p-5 opacity-0 animate-slideIn hidden md:block"
                          style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative">
                            <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-pink-500/50 flex items-center justify-center text-xs sm:text-sm md:text-base flex-shrink-0 mt-0.5 group-hover/card:scale-110 transition-transform">
                                💡
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm md:text-base font-bold text-pink-100 mb-0.5 sm:mb-1 md:mb-2 leading-tight group-hover/card:text-pink-50 transition-colors line-clamp-1">{aiInsights.smartCombinations.missingLinks[2].skill}</h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 leading-relaxed group-hover/card:text-gray-200 transition-colors line-clamp-2">{aiInsights.smartCombinations.missingLinks[2].unlock}</p>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-gradient-to-bl from-pink-500/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-5xl md:text-6xl mb-4">⚡</div>
                <p className="text-sm md:text-base">Loading combinations...</p>
              </div>
            ),
            subtitle: "Maximize potential",
            detail: "Powerful combinations and opportunities"
          }
        ]

        const slide = slides[currentSlide]

        return (
          <div id="slide-skill-insights" className="min-h-screen flex items-center justify-center px-4 md:px-8 relative overflow-hidden">
            {/* Radial gradient background */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => navigateHorizontal('skill-insights', -1, slides.length)}
              className="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
            >
              <span className="text-white text-xl md:text-2xl">←</span>
            </button>
            <button
              onClick={() => navigateHorizontal('skill-insights', 1, slides.length)}
              className="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
            >
              <span className="text-white text-xl md:text-2xl">→</span>
            </button>

            {/* Slide indicators */}
            <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHorizontalSlides(prev => ({ ...prev, 'skill-insights': idx }))}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-8 bg-primary-500' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <div className={`relative z-10 text-center transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`} id={`slide-skill-insights-${currentSlide}`} key={currentSlide}>
              <p className="text-gray-400 text-base md:text-xl mb-6 md:mb-8 px-4">
                {slide.title}
              </p>

              {slide.content}

              <p className="text-gray-400 text-sm md:text-lg mt-6 md:mt-8 max-w-2xl mx-auto px-4">
                {slide.subtitle}
              </p>

              <div className="mt-8 md:mt-12 inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mx-4">
                <span className="text-xs md:text-sm text-gray-400">{slide.detail}</span>
              </div>
            </div>
          </div>
        )
      }
    },

    // Section 5: Network Power
    metrics.collabCount > 0 && {
      id: 'network',
      content: (isVisible) => {
        const currentSlide = horizontalSlides['network'] || 0

        const slides = [
          // Slide 1: Total collaborations
          {
            title: "Professional network",
            content: (
              <div>
                <div className="text-[100px] md:text-[120px] lg:text-[200px] font-black leading-none bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent mb-6 md:mb-8">
                  {metrics.collabCount}
                </div>
                <p className="text-xl md:text-2xl lg:text-3xl text-white font-semibold mb-8 md:mb-12 px-4">
                  Active Collaborations
                </p>
                {metrics.collabPercentile >= 50 && (
                  <div className="inline-flex flex-col md:flex-row items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-primary-500/20 to-purple-500/20 backdrop-blur-xl border border-primary-500/30">
                    <span className="text-3xl md:text-4xl">🌟</span>
                    <div className="text-center md:text-left">
                      <p className="text-xs md:text-sm text-gray-400">In the top</p>
                      <p className="text-2xl md:text-3xl font-bold text-primary-400">{100 - metrics.collabPercentile}%</p>
                    </div>
                    <span className="text-xs md:text-sm text-gray-400">of connectors</span>
                  </div>
                )}
              </div>
            ),
            insight: `Platform average: ${metrics.avgCollabs} collaborations`
          },
          // Slide 2: Similar Professionals
          {
            title: "Professionals like " + getSubjectPronoun(isOwnDNA),
            content: (
              <div className="max-w-2xl mx-auto px-4">
                {metrics.similarProfessionals && metrics.similarProfessionals.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {metrics.similarProfessionals.slice(0, 5).map((prof, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 md:p-4 flex items-center justify-between hover:border-primary-500/50 transition-all">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm md:text-base">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm md:text-base text-white font-semibold">Similar Professional</div>
                            <div className="text-xs text-gray-400">{prof.sharedSkills} shared skills</div>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-xl md:text-2xl font-bold text-primary-400">{prof.similarity}%</div>
                          <div className="text-[10px] md:text-xs text-gray-500">match</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8 md:py-12">
                    <div className="text-5xl md:text-6xl mb-4">🔍</div>
                    <p className="text-sm md:text-base">No similar professionals found yet</p>
                    <p className="text-xs md:text-sm mt-2">More users joining soon!</p>
                  </div>
                )}
              </div>
            ),
            insight: `Found ${metrics.similarProfessionals?.length || 0} professionals with similar skills`
          },
          // Slide 3: Collaboration Opportunities
          {
            title: "Where to network next",
            content: (
              <div className="max-w-2xl mx-auto px-4">
                <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">Based on match scores and complementary skills</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white/5 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 md:p-6 text-center">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3">🎯</div>
                    <div className="text-2xl md:text-3xl font-black text-green-400 mb-1 md:mb-2">{metrics.highMatchCount}</div>
                    <p className="text-xs md:text-sm text-gray-400">High matches</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">90%+ compatibility</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-primary-500/30 rounded-xl p-4 md:p-6 text-center">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3">💼</div>
                    <div className="text-2xl md:text-3xl font-black text-primary-400 mb-1 md:mb-2">{metrics.topMatchScore}%</div>
                    <p className="text-xs md:text-sm text-gray-400">Best match</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Top compatibility</p>
                  </div>
                </div>
              </div>
            ),
            insight: "Connect with high matches to unlock new opportunities"
          }
        ]

        const slide = slides[currentSlide]

        return (
          <div id="slide-network" className="min-h-screen flex items-center justify-center px-4 md:px-8 text-center relative overflow-hidden">
            {/* Navigation arrows */}
            <button
              onClick={() => navigateHorizontal('network', -1, slides.length)}
              className="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
            >
              <span className="text-white text-xl md:text-2xl">←</span>
            </button>
            <button
              onClick={() => navigateHorizontal('network', 1, slides.length)}
              className="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
            >
              <span className="text-white text-xl md:text-2xl">→</span>
            </button>

            {/* Slide indicators */}
            <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHorizontalSlides(prev => ({ ...prev, network: idx }))}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-8 bg-primary-500' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <div className={`max-w-3xl transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`} key={currentSlide}>
              <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8 px-4">
                {slide.title}
              </p>

              {slide.content}

              <p className="mt-8 md:mt-12 text-xs md:text-sm text-gray-500 px-4">{slide.insight}</p>
            </div>
          </div>
        )
      }
    },

    // Section 6: Projects Showcase
    (() => {
      // Sort by pinned first, then by position/creation date
      const pinnedItems = localShowcaseItems
        .filter(item => item.pinned)
      const unpinnedItems = localShowcaseItems
        .filter(item => !item.pinned)
      const allItems = [...pinnedItems, ...unpinnedItems].slice(0, 3)
      
      return allItems.length > 0 && {
        id: 'projects',
        content: (isVisible) => {
          const projects = allItems

          const currentSlide = horizontalSlides['projects'] || 0
          const project = projects[currentSlide]

          return (
            <div id="slide-showcase" className="min-h-screen flex items-center justify-center px-4 md:px-8 text-center relative overflow-hidden">
              {/* Navigation arrows */}
              {projects.length > 1 && (
                <>
                  <button
                    onClick={() => navigateHorizontal('projects', -1, projects.length)}
                    className="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
                  >
                    <span className="text-white text-xl md:text-2xl">←</span>
                  </button>
                  <button
                    onClick={() => navigateHorizontal('projects', 1, projects.length)}
                    className="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
                  >
                    <span className="text-white text-xl md:text-2xl">→</span>
                  </button>
                </>
              )}

              {/* Slide indicators */}
              {projects.length > 1 && (
                <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {projects.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHorizontalSlides(prev => ({ ...prev, projects: idx }))}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'w-8 bg-primary-500' : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className={`max-w-4xl transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`} id={`slide-showcase-${currentSlide}`} key={currentSlide}>
                <p className="text-base md:text-lg text-gray-500 mb-8 md:mb-12 px-4">
                  Showcase
                </p>

                {project && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-8 md:mb-12">
                  {/* Project Image */}
                  {project.image_url && (
                    <ProjectImageWithFallback 
                      src={project.image_url} 
                      alt={project.title}
                    />
                  )}

                  {/* Project Content */}
                  <div className="p-6 md:p-8">
                    <div className="text-left mb-6">
                      <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
                        {project.title}
                      </h3>

                      {/* Date range */}
                      {(project.start_date || project.end_date) && (
                        <p className="text-xs md:text-sm text-primary-400 font-semibold mb-4">
                          {project.start_date && new Date(project.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          {project.end_date ? ` – ${project.is_present ? 'Present' : new Date(project.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : project.is_present ? ' – Present' : ''}
                        </p>
                      )}

                      {/* Description */}
                      {project.description && (
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                          {project.description}
                        </p>
                      )}

                      {/* Metadata fields */}
                      <div className="space-y-4 mb-6">
                        {project.metadata?.institution && (
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">🏢</span>
                            <span className="text-gray-400 text-sm md:text-base">{project.metadata.institution}</span>
                          </div>
                        )}

                        {project.metadata?.collaborators && project.metadata.collaborators.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">👥</span>
                            <span className="text-gray-400 text-sm md:text-base">{project.metadata.collaborators.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags/Skills */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                          {project.tags.slice(0, 6).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/40 text-xs md:text-sm text-primary-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 6 && (
                            <span className="px-3 py-1 text-xs md:text-sm text-gray-500">
                              +{project.tags.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Links */}
                      {project.links && project.links.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {project.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105"
                            >
                              {link.label || 'View'} →
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}

                <p className="text-xs md:text-sm text-gray-500 px-4">
                  {projects.length > 1 ? `Item ${currentSlide + 1} of ${projects.length}` : 'Showcase item to the world'}
                </p>
              </div>
            </div>
          )
        }
      }
    })(),

    // Section 7: Matches Preview
    metrics.highMatchCount > 0 && {
      id: 'matches',
      content: (isVisible) => (
        <div id="slide-matches" className="min-h-screen flex items-center justify-center px-4 md:px-8 text-center relative overflow-hidden">
          <div className={`max-w-3xl transition-all duration-1500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8">
              Waiting to connect
            </p>

            {/* Number of high matches */}
            <div className="mb-8 md:mb-12">
              <span className="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-primary-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {metrics.highMatchCount}
              </span>
            </div>

            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6 px-4">
              People with 90%+ compatibility
            </p>

            <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 px-4">
              Top match score: <span className="text-primary-400 font-bold">{metrics.topMatchScore}%</span>
            </p>

            {/* CTA */}
            <button className="px-6 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105">
              Discover Your Matches →
            </button>
          </div>
        </div>
      )
    },

    // Section 8: Final CTA
    {
      id: 'cta',
      content: (isVisible) => isOwnDNA ? (
        // Own DNA - Show Share options
        <div className="min-h-screen flex items-center justify-center px-4 md:px-8 text-center relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-primary-500/10 to-[#0A0A0A]"></div>

          <div className={`relative z-10 max-w-3xl transition-all duration-1500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <div className="text-6xl md:text-8xl mb-6 md:mb-8">🧬</div>

            <h2 className="text-5xl md:text-6xl lg:text-8xl font-black bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 md:mb-8 leading-tight px-4">
              Share Your DNA
            </h2>

            <p className="text-base md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
              Showcase your professional identity and connect with people who complement your skills
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-4 items-center">
              <button 
                onClick={() => setIsDownloadModalOpen(true)}
                className="px-8 md:px-10 py-3 md:py-3.5 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                📥 Download & Share DNA
              </button>
              <button 
                onClick={() => {
                  const url = window.location.href
                  navigator.clipboard.writeText(url)
                  const notification = document.createElement('div')
                  notification.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce'
                  notification.innerHTML = '✓ DNA link copied to clipboard!'
                  document.body.appendChild(notification)
                  setTimeout(() => notification.remove(), 3000)
                }}
                className="px-8 md:px-10 py-3 md:py-3.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🔗 Share DNA Link
              </button>
            </div>

            <p className="text-sm md:text-base text-gray-500 px-4">
              Download slides and share your Professional DNA
            </p>
          </div>
        </div>
      ) : (
        // Someone else's DNA - Show CTA to create own
        <div className="min-h-screen flex items-center justify-center px-4 md:px-8 text-center relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-primary-500/10 to-[#0A0A0A]"></div>

          <div className={`relative z-10 max-w-3xl transition-all duration-1500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <div className="text-6xl md:text-8xl mb-6 md:mb-8">🧬</div>

            <h2 className="text-5xl md:text-6xl lg:text-8xl font-black bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 md:mb-8 leading-tight px-4">
              Get Your Own DNA
            </h2>

            <p className="text-base md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
              Create your professional DNA, map your unique skills, and connect with people who complement your expertise
            </p>
            <a 
              href="/dna"
              className="inline-block px-8 md:px-10 py-4 md:py-5 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold text-base md:text-lg transition-all duration-300 hover:scale-105 mb-6"
            >
              Start Your DNA Journey →
            </a>

            <p className="text-sm md:text-base text-gray-500 px-4">
              Join thousands building their professional identity
            </p>
          </div>
        </div>
      )
    }
  ].filter(Boolean)

  return (
    <div className="relative bg-[#0A0A0A] text-white">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Section Progress Dots */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' })
              setCurrentSection(index)
            }}
            className={`transition-all duration-300 ${
              currentSection === index
                ? 'bg-primary-500 scale-150 w-2.5 h-2.5'
                : 'bg-white/30 hover:bg-white/50 w-2 h-2'
            } rounded-full`}
            aria-label={`Go to section ${index + 1}`}
            title={`Section ${index + 1}`}
          />
        ))}
      </div>

      {/* Sections */}
      <div>
        {sections.map((section, index) => (
          <section
            key={section.id}
            ref={(el) => (sectionsRef.current[index] = el)}
            className="relative"
          >
            {section.content(visibleSections.has(index))}
          </section>
        ))}
      </div>

      {/* Add shimmer, slideIn, and DNA pan animations to global styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        @keyframes dna-pan {
          0% {
            transform: translateX(-100vw);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }
        .animate-dna-pan {
          animation: dna-pan 8s ease-in-out infinite;
        }
      `}</style>

      {/* Download Slides Modal */}
      <CardsDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  )
}
