'use client'

export default function BentoGrid() {
    const testimonials = [
        {
            initials: 'PN',
            name: 'Patel Neel Maheshkumar',
            role: 'Co-Founder @ CodingGita',
            text: 'Appreciate the thoughtful and data-backed insights from Openpools.in. Great to work with a team that values real signals over surface-level metrics.',
            score: 99
        },
        {
            initials: 'JD',
            name: 'Julia D.',
            role: 'Product Lead',
            text: 'OpenPools cut through the noise. I found a partner who actually understood the technical nuances of our protocol within 48 hours of joining.',
            score: 96
        }
    ]

    return (
        <section className="py-24 bg-[#0A0A0A] text-white overflow-hidden relative border-t border-white/5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,transparent_50%)] bg-fixed opacity-40 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500 tracking-tight">
                        Why Choose OpenPools?
                    </h2>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
                        Built for professionals who value meaningful connections.
                    </p>
                </div>

                {/* 5-Column Grid for more precise control: 3/5 Left, 2/5 Right (60/40 Split) */}
                <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-2 gap-4 h-auto md:h-[680px]">

                    {/* Item 1: E2E Secure Bridge (Top Left - Spans 3 cols) */}
                    <div className="md:col-span-3 row-span-1 glass-dark rounded-[2.5rem] p-8 md:p-10 border border-white/[0.08] relative overflow-hidden group hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.1)] transition-all duration-500">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 border border-green-500/20 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">Your contact information stays private until you approve collaboration requests. You're in control.</p>
                                </div>
                                <div>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Direct Messaging</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">Built-in chat lets you communicate seamlessly with your collaborators without leaving the platform.</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                                    Sovereign Identity
                                </span>
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                                    E2E Comms Channel
                                </span>
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-green-500/[0.04] blur-[100px] rounded-full pointer-events-none"></div>
                    </div>

                    {/* Item 2: Trusted Builders (The Main Thing - Scaled Up - Spans 2 cols, 2 rows) */}
                    <div className="md:col-span-2 md:row-span-2 glass-dark rounded-[2.5rem] p-10 border border-white/[0.12] relative overflow-hidden group hover:border-white/[0.2] transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:rotate-6 transition-transform">
                                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.5em]">Trusted Builders</h3>
                            </div>

                            <div className="space-y-12 flex-1">
                                {testimonials.map((story, i) => (
                                    <div key={i} className="space-y-5 pb-10 border-b border-white/[0.05] last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs font-bold text-white/50">{story.initials}</div>
                                                <div>
                                                    <div className="text-[14px] font-bold text-white leading-none">{story.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">{story.role}</div>
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-primary-500 tabular-nums tracking-tighter">{story.score}% <span className="text-[8px] uppercase tracking-tighter text-gray-600 block text-right">Match</span></div>
                                        </div>
                                        <p className="text-[15px] text-gray-300 leading-relaxed italic font-medium">"{story.text}"</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-10 border-t border-white/5">
                                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.4em] text-center">
                                    Verified Resonance Success
                                </p>
                            </div>
                        </div>
                        {/* Active Ambient Glow */}
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-500/[0.05] rounded-full blur-[120px] pointer-events-none group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Item 3: AI Insights (Bottom Left - 1 col) */}
                    <div className="md:col-span-1 glass-dark rounded-[2.5rem] p-8 border border-white/[0.08] relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6 border border-primary-500/20 group-hover:rotate-12 transition-transform">
                                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 tracking-tight">AI Insights</h3>
                                <p className="text-gray-400 text-[12px] leading-relaxed font-medium">Human Powered AI analyzes profiles to extract the most relevant signal keywords.</p>
                            </div>

                            <div className="mt-6 space-y-3 relative">
                                <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary-500 to-transparent animate-pulse"></div>
                                <div className="pl-4 space-y-2">
                                    <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                                        <div className="h-full bg-primary-500/40 w-3/4"></div>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full w-5/6 overflow-hidden">
                                        <div className="h-full bg-primary-500/40 w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item 4: Journal (Bottom Center - 2 cols) */}
                    <div className="md:col-span-2 glass-dark rounded-[2.5rem] p-8 border border-white/[0.08] relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
                                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                                    <h3 className="text-xl font-bold tracking-tight">Professional Journal</h3>
                                    <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest border border-amber-500/20 px-2 py-0.5 rounded mt-2 md:mt-0">Outcome Reflection</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed font-medium max-w-md">Track your networking journey with a built-in journal to document insights and technical reflections after every session.</p>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></div>
                                    Capture Daily Resonance
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/[0.02] blur-[60px] rounded-full"></div>
                    </div>

                </div>

                {/* Live System Status */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/[0.02] rounded-full border border-white/5 shadow-inner">
                        <div className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                            System: <span className="text-gray-300">1,429 Resonance Signals</span> captured today
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}
