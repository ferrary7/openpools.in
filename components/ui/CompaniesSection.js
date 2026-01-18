'use client'

import { useState, useEffect } from 'react'

export default function CompaniesSection() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies')
        const data = await response.json()
        setCompanies(data.companies || [])
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  if (loading) {
    return null
  }

  if (!companies || companies.length === 0) {
    return null
  }

  // Add custom CSS for scrolling animations
  const style = `
    @keyframes scroll-right-companies {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }

    @keyframes scroll-left-companies {
      0% {
        transform: translateX(-50%);
      }
      100% {
        transform: translateX(0);
      }
    }

    .animate-scroll-companies-right {
      animation: scroll-right-companies 40s linear infinite;
    }

    .animate-scroll-companies-left {
      animation: scroll-left-companies 50s linear infinite;
    }
  `

  return (
    <>
      <style>{style}</style>
      <div className="py-0">
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wide font-semibold">Companies represented</p>
        
        {/* Row 1 - Scrolls right */}
        <div className="mb-3 overflow-hidden">
          <div className="flex gap-2 md:gap-3 animate-scroll-companies-right">
            {[...companies, ...companies].map((company, idx) => (
              <span
                key={`row1-${idx}`}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-full whitespace-nowrap shrink-0 border border-primary-400/40 bg-primary-500/15 text-primary-500"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolls left at different speed */}
        <div className="overflow-hidden">
          <div className="flex gap-2 md:gap-3 animate-scroll-companies-left">
            {[...companies.slice(Math.floor(companies.length / 2)), ...companies.slice(0, Math.floor(companies.length / 2)), ...companies].map((company, idx) => (
              <span
                key={`row2-${idx}`}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-full whitespace-nowrap shrink-0 border border-primary-400/30 bg-primary-500/10 text-primary-500/80"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
