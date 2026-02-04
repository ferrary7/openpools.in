import MatchesList from '@/components/matches/MatchesList'

export default function MatchesPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Refined Product Depth - More Prominent Grids */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary-500/[0.07] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-pink-500/[0.07] rounded-full blur-[100px]"></div>
        {/* Prominent Technical Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Matches</h1>
          <p className="text-gray-600 mt-2 font-medium">
            Check out your curated list of potential collab partners
          </p>
        </div>

        <MatchesList />
      </div>
    </div>
  )
}
