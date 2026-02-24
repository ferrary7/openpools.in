'use client'

export default function DoppelgangerBackground({ children }) {
    return (
        <div className="min-h-screen bg-[#020202] text-white relative overflow-hidden">
            {/* Mesh Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary-900/30 blur-[150px] animate-pulse-subtle"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-600/10 blur-[130px] animate-float"></div>
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary-800/20 blur-[100px]"></div>
            </div>

            {/* Technical Overlays */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3BaseFilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Micro Grid */}
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                {/* Radical Scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent h-[2px] w-full animate-[scanline_8s_linear_infinite]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full">
                {children}
            </div>

            <style jsx global>{`
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
            `}</style>
        </div>
    )
}
