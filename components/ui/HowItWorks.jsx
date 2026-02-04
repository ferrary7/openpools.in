'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0)
    const sectionRef = useRef(null)

    const steps = [
        {
            id: 1,
            title: "AI Resonates Your Signals",
            description: "Simply upload your Resume PDF. Our AI agent analyzes your document and automatically extracts meaningful signals representing your skills, experience, and expertise.",
            tags: ["Machine Learning", "Python", "Product Strategy", "React"],
            color: "from-blue-500 to-cyan-500"
        },
        {
            id: 2,
            title: "Discover Matches",
            description: "Our algorithm analyzes skill overlaps, experience levels, and professional interests to calculate weighted compatibility scores. Browse curated matches ranked by relevance.",
            scores: [98, 92, 85],
            color: "from-primary-500 to-purple-600"
        },
        {
            id: 3,
            title: "Connect & Collaborate",
            description: "Send collaboration requests to professionals who interest you. Once accepted, unlock contact information and start chatting directly through our built-in messaging platform.",
            features: ["Encrypted Chat", "Privacy First", "Direct Contact"],
            color: "from-green-500 to-emerald-600"
        }
    ]

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return

            const sectionTop = sectionRef.current.offsetTop
            const sectionHeight = sectionRef.current.offsetHeight
            const scrollY = window.scrollY
            const viewportHeight = window.innerHeight

            // Calculate which step should be active based on scroll position relative to the section
            const relativeScroll = scrollY - sectionTop + viewportHeight / 3
            const stepHeight = sectionHeight / steps.length

            const newActiveStep = Math.min(
                steps.length - 1,
                Math.max(0, Math.floor(relativeScroll / stepHeight))
            )

            setActiveStep(newActiveStep)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <section ref={sectionRef} className="relative py-32 bg-[#0f0f0f] mb-0">
            {/* Ambient Background Glows - Isolated Overflow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
                        How OpenPools Works
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        Three simple steps to find your perfect professional match
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* Left Side: Sticky Visuals */}
                    <div className="hidden lg:block lg:sticky top-32 h-[500px] w-full">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">

                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`absolute inset-0 transition-all duration-700 ease-in-out p-8 flex flex-col items-center justify-center
                    ${activeStep === index ? 'opacity-100 z-10 translate-y-0 scale-100' : 'opacity-0 z-0 translate-y-8 scale-95'}
                  `}
                                >
                                    {/* Step 1: Resume Upload Mock */}
                                    {index === 0 && (
                                        <div className="w-full max-w-sm bg-[#1a1a1a] rounded-xl border border-white/10 p-6 relative overflow-hidden group">
                                            {/* Glowing scanning effect */}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scan"></div>

                                            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center bg-white/5 transition-colors group-hover:border-primary-500/50 group-hover:bg-primary-500/5">
                                                <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div className="text-white font-medium mb-1">Resume.pdf</div>
                                                <div className="text-xs text-gray-500">1.2 MB • Scanning...</div>
                                            </div>

                                            {/* Extracted Chips Animation */}
                                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                                {['Growth', 'Strategy', 'Marketing', 'Leadership'].map((tag, i) => (
                                                    <span key={i} className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs border border-primary-500/30 animate-fadeIn" style={{ animationDelay: `${i * 0.2}s` }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Realistic Match Card */}
                                    {index === 1 && (
                                        <div className="w-full max-w-sm bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
                                            {/* Match Badge */}
                                            <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-[#0f0f0f] border-2 border-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                                <span className="text-xs font-bold text-green-400">94%</span>
                                            </div>

                                            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                                            <div className="px-6 pb-6 -mt-10 relative">
                                                <div className="w-20 h-20 rounded-xl bg-gray-700 border-4 border-[#1a1a1a] mb-3 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-2xl">👨‍💻</div>
                                                </div>

                                                <h3 className="text-lg font-bold text-white">Darshan Kumar V</h3>
                                                <p className="text-sm text-gray-400 mb-4">Head of Growth • openpools.in</p>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>Skill Overlap</span>
                                                        <span className="text-white">High Resonance</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[94%]"></div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                                        {['Growth', 'Strategy', 'Scale'].map((t) => (
                                                            <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-300">{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Chat Interface Mock */}
                                    {index === 2 && (
                                        <div className="w-full max-w-sm bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[320px]">
                                            {/* Chat Header */}
                                            <div className="p-4 border-b border-white/5 bg-[#252525] flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 relative">
                                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#252525] rounded-full"></div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">Himanshu Patil</div>
                                                    <div className="text-xs text-green-400">Online</div>
                                                </div>
                                            </div>

                                            {/* Chat Messages */}
                                            <div className="flex-1 p-4 space-y-4 bg-[#1a1a1a]">
                                                {/* System Message */}
                                                <div className="flex justify-center">
                                                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                                        Resonance detected based on "Growth" & "Marketing"
                                                    </span>
                                                </div>

                                                {/* Incoming */}
                                                <div className="flex gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shrink-0"></div>
                                                    <div className="bg-[#252525] p-3 rounded-2xl rounded-tl-none border border-white/5 max-w-[85%]">
                                                        <p className="text-xs text-gray-300">Hey! Saw we matched on OpenPools. Your work on growth marketing looks interesting.</p>
                                                    </div>
                                                </div>

                                                {/* Outgoing */}
                                                <div className="flex gap-3 flex-row-reverse">
                                                    <div className="bg-primary-600 p-3 rounded-2xl rounded-tr-none text-white max-w-[85%]">
                                                        <p className="text-xs">Thanks Himanshu! I'm free for a quick sync this week.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Input Area */}
                                            <div className="p-3 border-t border-white/5 bg-[#252525]">
                                                <div className="h-8 bg-[#1a1a1a] rounded-full border border-white/10 flex items-center px-3 text-xs text-gray-500">
                                                    Type a message...
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>
                    </div>

                    {/* Right Side: Scrollable Text */}
                    <div className="space-y-24 lg:space-y-[50vh] pb-[20vh]">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`py-8 transition-all duration-500 ${activeStep === index ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br ${step.color}`}>
                                        {step.id}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                                </div>
                                <p className="text-lg text-gray-400 leading-relaxed pl-16 border-l-2 border-white/10">
                                    {step.description}
                                </p>

                                {/* Mobile visualization fallback */}
                                <div className="lg:hidden mt-8">
                                    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-6">
                                        {/* Step 1: Resume Upload Mock */}
                                        {index === 0 && (
                                            <div className="w-full bg-[#1a1a1a] rounded-xl border border-white/10 p-6 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scan"></div>
                                                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center bg-white/5">
                                                    <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-3">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                    </div>
                                                    <div className="text-white font-medium text-sm mb-1">Resume.pdf</div>
                                                    <div className="text-[10px] text-gray-500">Scanning...</div>
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                                    {['Growth', 'Strategy', 'Marketing'].map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-[10px] border border-primary-500/30">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Realistic Match Card */}
                                        {index === 1 && (
                                            <div className="w-full bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-xl relative">
                                                <div className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-[#0f0f0f] border-2 border-green-500 flex items-center justify-center shadow-lg">
                                                    <span className="text-[10px] font-bold text-green-400">94%</span>
                                                </div>
                                                <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                                                <div className="px-4 pb-4 -mt-8 relative">
                                                    <div className="w-16 h-16 rounded-xl bg-gray-700 border-4 border-[#1a1a1a] mb-2 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-xl">👨‍💻</div>
                                                    </div>
                                                    <h3 className="text-base font-bold text-white">Darshan Kumar V</h3>
                                                    <p className="text-xs text-gray-400 mb-3">Head of Growth • openpools.in</p>
                                                    <div className="space-y-2">
                                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[94%]"></div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {['Growth', 'Strategy', 'Scale'].map((t) => (
                                                                <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-300">{t}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Chat Interface Mock */}
                                        {index === 2 && (
                                            <div className="w-full bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-xl flex flex-col h-[280px]">
                                                <div className="p-3 border-b border-white/5 bg-[#252525] flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 relative">
                                                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-[#252525] rounded-full"></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">Himanshu Patil</div>
                                                        <div className="text-[10px] text-green-400">Online</div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-3 space-y-3 bg-[#1a1a1a] overflow-hidden">
                                                    <div className="flex justify-center">
                                                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 truncate max-w-full">
                                                            Resonance: "Growth" & "Marketing"
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shrink-0"></div>
                                                        <div className="bg-[#252525] p-2 rounded-2xl rounded-tl-none border border-white/5 max-w-[85%]">
                                                            <p className="text-[10px] text-gray-300">Hey! Saw we matched. Your growth work looks interesting.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-row-reverse">
                                                        <div className="bg-primary-600 p-2 rounded-2xl rounded-tr-none text-white max-w-[85%]">
                                                            <p className="text-[10px]">Thanks Himanshu! Free for a sync this week.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2 border-t border-white/5 bg-[#252525]">
                                                    <div className="h-7 bg-[#1a1a1a] rounded-full border border-white/10 flex items-center px-3 text-[10px] text-gray-500">
                                                        Type a message...
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
