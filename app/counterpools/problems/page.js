'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'
import { validateCounterPoolsForm, DOMAINS, DIFFICULTY } from '@/lib/counterpools-validation'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function ProblemsSubmission() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    linkedIn: '',
    problemTitle: '',
    domain: '',
    difficulty: '',
    description: '',
    expectedOutcome: '',
    links: '',
    solutionAdoption: false,
    hiringInterest: false,
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error for this field when user starts editing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validation = validateCounterPoolsForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const response = await fetch('/api/counterpools/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors)
        } else {
          setErrors({ submit: result.message || 'Failed to submit problem' })
        }
        setLoading(false)
        return
      }

      setSubmitted(true)
      setLoading(false)
    } catch (err) {
      console.error('Submission error:', err)
      setErrors({ submit: 'Network error. Please try again.' })
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={`min-h-screen bg-black text-white flex flex-col items-center justify-center ${inter.className} overflow-x-hidden`}>
        {/* Gradient Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#d84a1b] via-[#d84a1b]/30 to-black opacity-40"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)`
        }}></div>
        
        <div className="relative z-10 text-center px-6 sm:px-12 py-20">
          {/* Success Checkmark */}
          <div className="mb-12 flex justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#d84a1b] flex items-center justify-center bg-[#d84a1b]/10">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 text-[#d84a1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Text */}
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d84a1b] mb-4">
            Submission Complete
          </p>
          <h1 className={`${playfairDisplay.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic mb-6 leading-[0.95] text-white`}>
            your challenge awaits
          </h1>
          <p className="text-sm sm:text-base font-medium uppercase tracking-[0.2em] text-white/70 mb-16 max-w-2xl mx-auto">
            Thank you for contributing to the arena. Your problem has been submitted for verification and will appear once approved.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  fullName: '', email: '', linkedIn: '', problemTitle: '', domain: '', difficulty: '', description: '', expectedOutcome: '', links: '', solutionAdoption: false, hiringInterest: false
                })
              }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] border-2 border-[#d84a1b] text-[#d84a1b] px-8 sm:px-12 py-3 sm:py-4 hover:bg-[#d84a1b] hover:text-black transition-all duration-300"
            >
              Post Another Challenge
            </button>
            <Link href="/counterpools/browse" className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d84a1b] text-black px-8 sm:px-12 py-3 sm:py-4 hover:bg-[#e04500] transition-all duration-300 inline-block">
              Browse All Challenges
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className} overflow-x-hidden selection:bg-[#d84a1b] selection:text-white`}>
      
      {/* Header & Marquee Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/counterpools" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#d84a1b] transition-colors flex items-center gap-2">
              <span className="text-lg leading-none">&larr;</span> <span className="hidden md:inline">Return</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <img src="/logo.svg" alt="openpools.in" className="h-3 md:h-7 opacity-90 hover:opacity-100 transition-opacity" />
              </Link>
              <span className="text-white/30 text-lg font-light hidden sm:inline">/</span>
              <div className={`${playfairDisplay.className} text-xs md:text-xl font-bold italic tracking-tight`}>
              counterpools<span className="text-[#d84a1b]">.</span>
            </div>
          </div>
            <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              Intake Form // 01
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col relative z-10 w-full">
        
        {/* Top Background Pattern Section (Hero) - Full screen width */}
        <div className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center overflow-hidden py-24 px-6 md:px-12">
          <div className="absolute inset-0 bg-[#d84a1b]"></div>
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/40 to-black"></div>

          <div className="relative z-10 text-center">
            <h1 className={`${playfairDisplay.className} text-[48px] sm:text-[60px] md:text-[90px] lg:text-[140px] italic leading-[0.9] tracking-tighter text-white drop-shadow-2xl`}>
              submit the <br className="hidden md:block"/> impossible.
            </h1>
            <p className={`${inter.className} mt-8 text-sm md:text-base font-medium uppercase tracking-[0.3em] leading-relaxed text-white/80 max-w-2xl`}>
              SHARE YOUR CHALLENGE AND LET THE WORLD'S BEST BUILDERS SOLVE IT
            </p>
          </div>
        </div>

        {/* 3-Column Grid - Full Screen Width */}
        <div className="relative z-10 w-full px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-white/10 w-full bg-black">
            
            {/* COLUMN 1: PROFILE */}
            <div className="border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col hover:bg-white/[0.02] transition-colors">
               <div className="border-b border-white/10 px-8 py-6 bg-white/[0.02]">
                  <h2 className="text-white/30 font-bold uppercase tracking-[0.4em] text-xs">
                    01 — The Expert
                  </h2>
               </div>
               <div className="p-8 md:p-12 lg:p-16 flex-grow flex flex-col justify-center space-y-16">
                  <div className="group relative">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] mb-4">Identity</label>
                    {errors.fullName && <p className="text-[10px] text-red-500 mb-2">{errors.fullName}</p>}
                    <input
                      type="text"
                      name="fullName"
                      required
                      autoComplete="off"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="First & Last Name"
                      className={`${playfairDisplay.className} w-full bg-transparent border-b border-white/20 pb-4 text-3xl md:text-4xl text-white placeholder-white/20 focus:outline-none focus:border-[#d84a1b] transition-colors rounded-none italic lowercase ${errors.fullName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="group relative">
                     <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] mb-4">Email</label>
                    {errors.email && <p className="text-[10px] text-red-500 mb-2">{errors.email}</p>}
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`w-full bg-transparent border-b border-white/20 pb-4 text-lg md:text-xl text-white placeholder-white/20 focus:outline-none focus:border-[#d84a1b] transition-colors rounded-none font-medium ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="group relative">
                     <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] mb-4">Credentials</label>
                    {errors.linkedIn && <p className="text-[10px] text-red-500 mb-2">{errors.linkedIn}</p>}
                    <input
                      type="url"
                      name="linkedIn"
                      autoComplete="off"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      placeholder="LinkedIn Profile URL"
                      className={`w-full bg-transparent border-b border-white/20 pb-4 text-lg md:text-xl text-white placeholder-white/20 focus:outline-none focus:border-[#d84a1b] transition-colors rounded-none font-medium ${errors.linkedIn ? 'border-red-500' : ''}`}
                    />
                  </div>
               </div>
            </div>

            {/* COLUMN 2: THE CHALLENGE */}
            <div className="border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col hover:bg-white/[0.02] transition-colors">
               <div className="border-b border-white/10 px-8 py-6 bg-white/[0.02]">
                  <h2 className="text-white/30 font-bold uppercase tracking-[0.4em] text-xs">
                    02 — The Problem
                  </h2>
               </div>
               <div className="p-8 md:p-12 lg:p-16 flex-grow flex flex-col justify-center space-y-16">
                  
                  <div className="group relative">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] mb-2">Challenge Title</label>
                    {errors.problemTitle && <p className="text-[10px] text-red-500 mb-2">{errors.problemTitle}</p>}
                    <span className="text-xs text-white/40 mb-4 block">Be clear and specific. Example: "Reduce latency in real-time data pipelines"</span>
                    <div className="relative">
                      <span className={`${playfairDisplay.className} absolute -left-6 top-0 text-7xl md:text-8xl text-white/10 italic leading-[0.7] pointer-events-none`}>
                        "
                      </span>
                      <textarea
                        name="problemTitle"
                        required
                        autoFocus
                        value={formData.problemTitle}
                        onChange={handleChange}
                        placeholder="Describe the specific problem to solve..."
                        rows="3"
                        className={`${playfairDisplay.className} w-full bg-transparent border-none text-3xl md:text-4xl lg:text-5xl text-white placeholder-white/20 focus:outline-none resize-none italic lowercase leading-tight ${errors.problemTitle ? 'border-b border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-12 pt-8 border-t border-white/10">
                    <div className="relative">
                       <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Sector</label>
                      {errors.domain && <p className="text-[10px] text-red-500 mb-2">{errors.domain}</p>}
                      <select
                        name="domain"
                        required
                        value={formData.domain}
                        onChange={handleChange}
                        className={`w-full bg-transparent border-b border-white/20 pb-4 text-lg md:text-xl text-white appearance-none focus:outline-none focus:border-[#d84a1b] focus:bg-white/5 transition-all duration-300 rounded-none cursor-pointer font-medium hover:bg-white/[0.01] ${errors.domain ? 'border-red-500' : ''}`}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d84a1b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '18px' }}
                      >
                        <option value="" disabled className="bg-black text-white/50">select sector...</option>
                        {DOMAINS.map(d => <option key={d} value={d} className="bg-black text-white">{d}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Complexity</label>
                      {errors.difficulty && <p className="text-[10px] text-red-500 mb-2">{errors.difficulty}</p>}
                      <select
                        name="difficulty"
                        required
                        value={formData.difficulty}
                        onChange={handleChange}
                        className={`w-full bg-transparent border-b border-white/20 pb-4 text-lg md:text-xl text-white appearance-none focus:outline-none focus:border-[#d84a1b] focus:bg-white/5 transition-all duration-300 rounded-none cursor-pointer font-medium hover:bg-white/[0.01] ${errors.difficulty ? 'border-red-500' : ''}`}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d84a1b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '18px' }}
                      >
                        <option value="" disabled className="bg-black text-white/50">select complexity...</option>
                        {DIFFICULTY.map(d => <option key={d} value={d} className="bg-black text-white">{d}</option>)}
                      </select>
                    </div>
                  </div>

               </div>
            </div>

            {/* COLUMN 3: THE STAKES */}
            <div className="flex flex-col hover:bg-white/[0.02] transition-colors">
               <div className="border-b border-white/10 px-8 py-6 bg-white/[0.02]">
                  <h2 className="text-white/30 font-bold uppercase tracking-[0.4em] text-xs">
                    03 — The Details
                  </h2>
               </div>
               
               <div className="p-8 md:p-12 lg:p-16 flex-grow flex flex-col space-y-16">
                     
                     <div className="space-y-12">
                       <div className="relative group">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] mb-4">Context & Limitations</label>
                        {errors.description && <p className="text-[10px] text-red-500 mb-2">{errors.description}</p>}
                        <span className="text-xs text-white/40 mb-3 block">What's the background? What are the constraints and boundaries?</span>
                        <textarea
                          name="description"
                          required
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe the context, constraints, and limitations..."
                          rows="4"
                          className={`w-full bg-white/[0.03] border border-white/10 p-6 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#d84a1b] transition-colors rounded-none resize-y leading-relaxed ${errors.description ? 'border-red-500' : ''}`}
                        />
                      </div>

                      <div className="relative group">
                         <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] mb-4">What Success Looks Like</label>
                        {errors.expectedOutcome && <p className="text-[10px] text-red-500 mb-2">{errors.expectedOutcome}</p>}
                        <span className="text-xs text-white/40 mb-3 block">Define the metrics, deliverables, and criteria for a winning solution.</span>
                        <textarea
                          name="expectedOutcome"
                          required
                          value={formData.expectedOutcome}
                          onChange={handleChange}
                          placeholder="What are the key deliverables and success criteria?"
                          rows="3"
                          className={`w-full bg-white/[0.03] border border-white/10 p-6 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#d84a1b] transition-colors rounded-none resize-y leading-relaxed ${errors.expectedOutcome ? 'border-red-500' : ''}`}
                        />
                      </div>

                      <div className="relative group">
                         <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] mb-4">Relevant Links (Optional)</label>
                        {errors.links && <p className="text-[10px] text-red-500 mb-2">{errors.links}</p>}
                        <span className="text-xs text-white/40 mb-3 block">Add resources, references, or documentation links (one URL per line)</span>
                        <textarea
                          name="links"
                          value={formData.links}
                          onChange={handleChange}
                          placeholder="https://example.com/resource&#10;https://example.com/docs"
                          rows="2"
                          className={`w-full bg-white/[0.03] border border-white/10 p-6 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#d84a1b] transition-colors rounded-none resize-y leading-relaxed font-mono text-sm ${errors.links ? 'border-red-500' : ''}`}
                        />
                      </div>
                     </div>

                     {/* Checkboxes */}
                     <div className="pt-8 border-t border-white/10 space-y-8">
                       <label className="flex items-start gap-6 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-8 h-8 mt-0.5 flex-shrink-0 rounded-lg transition-all duration-300">
                            <input type="checkbox" name="solutionAdoption" checked={formData.solutionAdoption} onChange={handleChange} className="sr-only"/>
                            <div className={`w-full h-full border-2 rounded-lg transition-all duration-300 flex items-center justify-center ${formData.solutionAdoption ? 'border-[#d84a1b] bg-[#d84a1b] scale-110' : 'border-white/40 group-hover:border-white/80 bg-transparent'}`}>
                               {formData.solutionAdoption && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className={`${playfairDisplay.className} block text-lg italic text-white group-hover:text-white/90 transition-colors`}>intent to adopt</span>
                            <span className="text-sm text-white/50 mt-2 block leading-relaxed font-medium">I am willing to implement the winning solution if it satisfies criteria.</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-6 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-8 h-8 mt-0.5 flex-shrink-0 rounded-lg transition-all duration-300">
                            <input type="checkbox" name="hiringInterest" checked={formData.hiringInterest} onChange={handleChange} className="sr-only"/>
                            <div className={`w-full h-full border-2 rounded-lg transition-all duration-300 flex items-center justify-center ${formData.hiringInterest ? 'border-[#d84a1b] bg-[#d84a1b] scale-110' : 'border-white/40 group-hover:border-white/80 bg-transparent'}`}>
                               {formData.hiringInterest && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className={`${playfairDisplay.className} block text-lg italic text-white group-hover:text-white/90 transition-colors`}>hiring potential</span>
                            <span className="text-sm text-white/50 mt-2 block leading-relaxed font-medium">I am open to mentoring or collaborating with the solvers on future projects.</span>
                          </div>
                        </label>
                     </div>
                  </div>
            </div> {/* Closes Column 3 */}
          </div> {/* Closes Grid */}

          {/* Submit Button Area - Spanning Full Width */}
          <div className="border-t border-white/10 bg-[#d84a1b]">
             {errors.submit && (
               <div className="bg-red-500/20 border-b border-red-500/50 p-4 text-red-300 text-sm font-medium text-center">
                 {errors.submit}
               </div>
             )}
             <button
               type="submit"
               disabled={loading}
               className="w-full bg-[#d84a1b] text-black py-12 px-12 flex flex-col items-center justify-center group hover:bg-white hover:text-[#d84a1b] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mb-4 block group-hover:opacity-100 transition-opacity">Final Step</span>
               <span className={`${playfairDisplay.className} text-4xl md:text-5xl font-bold italic flex items-center gap-4`}>
                 {loading ? 'transmitting...' : 'submit the impossible.'} 
                 <span className="text-4xl font-sans not-italic group-hover:translate-x-4 transition-transform duration-300 inline-block">&rarr;</span>
               </span>
             </button>
          </div>
        </div>
      </form>
      
      {/* Global CSS for Autofill Fix & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px transparent inset !important;
          -webkit-text-fill-color: white !important;
        }
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px transparent inset !important;
          -webkit-text-fill-color: white !important;
        }
        input::-webkit-calendar-picker-indicator {
          display: none;
        }
        /* Autocomplete Dropdown Styling */
        input::-webkit-contacts-auto-fill-button,
        input::-webkit-credentials-auto-fill-button {
          visibility: hidden;
          pointer-events: none;
          position: absolute;
          right: 0;
        }
        /* Target the autocomplete suggestions list */
        ::-webkit-autofill-popup-button {
          display: none !important;
        }
        ::-webkit-autofill-popup {
          background-color: #0a0a0a !important;
        }
        /* Datalist styling */
        datalist {
          background-color: #0a0a0a !important;
        }
        datalist option {
          background-color: #0a0a0a !important;
          color: white !important;
        }
        datalist option:hover {
          background-color: #d84a1b !important;
          color: black !important;
        }
        /* Select dropdown options */
        select option {
          background-color: #1a1a1a;
          color: white;
          padding: 12px;
        }
        select option:hover {
          background-color: #d84a1b;
          color: black;
        }
        input::-webkit-textfield-decoration-container {
          display: none;
        }
        input::-webkit-list-button {
          display: none;
        }
      `}} />

    </div>
  )
}