import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">OpenPools.ai</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Professional Match
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with peers, collaborators, and mentors who share your exact skill patterns.
            Powered by AI-driven keyword matching.
          </p>
          <div className="space-x-4">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-3">
              Learn More
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Keyword Profiles</h3>
              <p className="text-gray-600">
                AI extracts meaningful keywords from your resume and LinkedIn
              </p>
            </div>
            <div className="card">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Weighted compatibility scores based on skill overlaps
              </p>
            </div>
            <div className="card">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Find Your Tribe</h3>
              <p className="text-gray-600">
                Connect with people who truly understand your expertise
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          © 2025 OpenPools.ai. Built with Next.js, Supabase & Gemini.
        </div>
      </footer>
    </div>
  )
}
