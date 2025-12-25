'use client'

export function HeroCard({ profile, keywordProfile, totalMarkers, daysActive }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header gradient */}
      <div className="h-32 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>
      
      {/* Content */}
      <div className="p-8 relative -mt-16">
        {/* Profile section */}
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-lg">
            {profile?.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{profile?.full_name}</h3>
            {profile?.job_title && (
              <p className="text-primary-300">{profile.job_title}</p>
            )}
            {profile?.company && (
              <p className="text-gray-400 text-sm">@ {profile.company}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary-400">{totalMarkers}</div>
            <p className="text-xs text-gray-400 mt-1">Skills</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary-400">{daysActive}</div>
            <p className="text-xs text-gray-400 mt-1">Days Active</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl">🧬</div>
            <p className="text-xs text-gray-400 mt-1">DNA</p>
          </div>
        </div>

        {/* Main title */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-2">Professional<br/>DNA</h1>
          <p className="text-gray-400">Mapped on OpenPools</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-t border-white/10 px-8 py-6 text-center">
        <p className="text-xs text-gray-500">Your unique professional DNA</p>
      </div>
    </div>
  )
}

export function SkillsCard({ topSkills, profile }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-6">
        <p className="text-sm text-white/80">Skills Mastery</p>
        <h2 className="text-2xl font-bold text-white">{profile?.full_name}'s Top Skills</h2>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="space-y-4">
          {topSkills.slice(0, 5).map((skill, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-white">{skill.name}</span>
                </div>
                <span className="text-primary-300 font-bold">{skill.score}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-purple-500 h-full rounded-full" 
                  style={{ width: `${skill.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-t border-white/10 px-8 py-6 text-center">
        <p className="text-xs text-gray-500">Powered by OpenPools</p>
      </div>
    </div>
  )
}

export function JobsCard({ profile, topJobs }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6">
        <p className="text-sm text-white/80">Career Insight</p>
        <h2 className="text-2xl font-bold text-white">Perfect Roles</h2>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="space-y-4">
          {topJobs.slice(0, 3).map((job, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white">{job.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{job.description?.substring(0, 60)}...</p>
                </div>
                <div className="text-2xl flex-shrink-0">{idx === 0 ? '⭐' : idx === 1 ? '✨' : '💫'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-t border-white/10 px-8 py-6 text-center">
        <p className="text-xs text-gray-500">Based on your skills</p>
      </div>
    </div>
  )
}

export function NetworkCard({ metrics, profile }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-6">
        <p className="text-sm text-white/80">Network Stats</p>
        <h2 className="text-2xl font-bold text-white">Professional Network</h2>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {metrics.collabCount}
          </div>
          <p className="text-gray-400 mt-2">Active Collaborations</p>
        </div>

        {metrics.collabPercentile >= 50 && (
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30 text-center">
            <p className="text-sm text-gray-300">In the top</p>
            <p className="text-3xl font-bold text-cyan-300">{100 - metrics.collabPercentile}%</p>
            <p className="text-xs text-gray-400">of connectors</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-t border-white/10 px-8 py-6 text-center">
        <p className="text-xs text-gray-500">OpenPools Platform</p>
      </div>
    </div>
  )
}
