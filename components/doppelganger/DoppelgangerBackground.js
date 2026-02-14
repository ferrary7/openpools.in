'use client'

export default function DoppelgangerBackground({ children }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
            {/* Immersive Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Animated Glows */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Subtle Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                {/* Radial Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(5,5,5,0.8)_80%)]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    )
}
