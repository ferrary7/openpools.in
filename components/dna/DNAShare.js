'use client'

import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import DNACertificate from './DNACertificate'

export default function DNAShare({ profile, keywordProfile, isOwnDNA = true }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(0)

  const shareUrl = typeof window !== 'undefined' && profile?.id
    ? `${window.location.origin}/dna/${profile.id}`
    : ''
  const userName = profile?.full_name || 'My'
  const firstName = profile?.full_name?.split(' ')[0] || 'their'

  // If not own DNA, show "Create Yours" button instead of share options
  if (!isOwnDNA) {
    return (
      <section id="dna-share-section" className="relative py-24 overflow-hidden bg-[#1E1E1E]">
        {/* Subtle glow effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
                Create Your Professional DNA
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover your unique professional identity and share it with the world
            </p>
          </div>

          {/* Create Yours CTA */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Want your own Professional DNA?
              </h3>
              <p className="text-gray-400 mb-8">
                Join OpenPools and create your unique professional identity with AI-powered DNA sequencing
              </p>
              <a
                href="/dna"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Yours Now</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div')
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-primary-500'
    notification.className = `fixed top-24 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce`
    notification.innerHTML = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    showNotification('✓ Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const totalKeywords = profile?.keyword_profiles?.total_keywords || '50+'

  const shareMessages = [
    `My professional DNA analyzed and verified by OpenPools AI - ${totalKeywords} unique skills across my expertise areas. View my credential: ${shareUrl}`,
    `Just received my Professional DNA Certificate from OpenPools. AI-verified visualization of my skills and expertise. Check it out: ${shareUrl}`,
    `Proud to share my OpenPools Professional DNA - a credible, AI-analyzed map of my verified skills and competencies: ${shareUrl}`,
    `My professional expertise visualized through OpenPools DNA analysis. ${totalKeywords} verified skills in an interactive certificate: ${shareUrl}`
  ]

  const handleLinkedInShare = () => {
    const message = shareMessages[selectedMessage]

    navigator.clipboard.writeText(message).then(() => {
      showNotification('✓ Message copied! Paste it in LinkedIn')
    })

    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedinUrl, '_blank', 'width=600,height=600')
  }

  const handleTwitterShare = () => {
    const message = shareMessages[selectedMessage]
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const handleDownloadCard = async () => {
    setDownloading(true)
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default

      // Create a temporary container for the certificate
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'fixed'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      document.body.appendChild(tempContainer)

      // Render the certificate component
      const root = createRoot(tempContainer)

      // Wrap the render in a promise to wait for completion
      await new Promise((resolve) => {
        root.render(<DNACertificate profile={profile} keywordProfile={keywordProfile} />)
        // Give it more time to render and load images
        setTimeout(resolve, 1000)
      })

      // Capture the certificate
      const canvas = await html2canvas(tempContainer.firstChild, {
        backgroundColor: '#1E1E1E',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: 1700
      })

      // Clean up
      root.unmount()
      document.body.removeChild(tempContainer)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${profile?.full_name?.replace(/\s+/g, '-').toLowerCase() || 'my'}-professional-dna-certificate.png`
        link.click()
        URL.revokeObjectURL(url)
        setDownloading(false)
        showNotification('✓ Professional DNA Certificate downloaded!')
      })
    } catch (error) {
      console.error('Download failed:', error)
      setDownloading(false)
      showNotification('Failed to download. Please try again.', 'error')
    }
  }

  return (
    <section id="dna-share-section" className="relative py-24 overflow-hidden bg-[#1E1E1E]">
      {/* Subtle glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              Share Your DNA Certificate
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Download and share your verified professional credential across platforms
          </p>
        </div>

        {/* Share Options */}
        <div className="space-y-6">
          {/* Main Share Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* LinkedIn Share */}
            <button
              onClick={handleLinkedInShare}
              className="group relative bg-gradient-to-br from-[#0077B5]/10 to-transparent backdrop-blur-sm border border-[#0077B5]/30 hover:border-[#0077B5]/50 text-white py-5 px-6 rounded-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0077B5]/0 to-[#0077B5]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col items-center gap-3">
                <svg className="w-8 h-8 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm font-medium">LinkedIn</span>
              </div>
            </button>

            {/* Twitter Share */}
            <button
              onClick={handleTwitterShare}
              className="group relative bg-gradient-to-br from-[#1DA1F2]/10 to-transparent backdrop-blur-sm border border-[#1DA1F2]/30 hover:border-[#1DA1F2]/50 text-white py-5 px-6 rounded-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1DA1F2]/0 to-[#1DA1F2]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col items-center gap-3">
                <svg className="w-8 h-8 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span className="text-sm font-medium">Twitter</span>
              </div>
            </button>

            {/* Download Card */}
            <button
              onClick={handleDownloadCard}
              disabled={downloading}
              className="group relative bg-gradient-to-br from-primary-500/10 to-purple-500/10 backdrop-blur-sm border border-primary-500/30 hover:border-primary-500/50 text-white py-5 px-6 rounded-xl transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex flex-col items-center gap-3">
                {downloading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-sm font-medium">Download Certificate</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Copy Link */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-black/20 rounded-lg px-4 py-3 font-mono text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 hover:border-primary-500/50 text-primary-400 px-4 py-3 rounded-lg transition-all duration-200"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Message Selector */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Choose your share message
            </h4>
            <div className="grid gap-2">
              {shareMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMessage(index)}
                  className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedMessage === index
                      ? 'bg-primary-500/10 border-primary-500/50 text-gray-200'
                      : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <p className="text-sm">{message}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              💡 Your DNA Certificate includes verified skills, timestamp, and a unique verification code when downloaded
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
