'use client'

export default function ProfilePreviewCard({ profileData, onEdit }) {
  const getInitials = () => {
    if (!profileData?.full_name) return '?'
    const parts = profileData.full_name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return profileData.full_name[0].toUpperCase()
  }

  const displayName = profileData?.full_name?.trim() ? profileData.full_name : null
  const hasSocialLinks = profileData?.linkedin_url || profileData?.github_url || profileData?.website || profileData?.twitter_url

  return (
    <div className="card bg-gradient-to-br from-primary-50 via-white to-purple-50 border-2 border-primary-200 shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Top Row - Profile Picture & Basic Info with Edit Button */}
        <div className="flex gap-4 items-start">
          {/* Left Section - Profile Picture & Basic Info */}
          <div className="flex gap-4 flex-1 min-w-0">
            {/* Profile Picture */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
              {profileData?.profile_picture_url ? (
                <img
                  src={profileData.profile_picture_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              {displayName && (
                <h3 className="font-bold text-2xl md:text-3xl text-gray-900 mb-1">
                  {displayName}
                </h3>
              )}

              {(profileData?.job_title || profileData?.company) && (
                <p className="text-gray-700 font-medium text-sm md:text-base leading-snug mb-1">
                  {profileData.job_title}
                  {profileData.job_title && profileData.company && ' at '}
                  {profileData.company}
                </p>
              )}

              {profileData?.location && (
                <p className="text-gray-600 text-xs md:text-sm flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profileData.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Edit Button - Desktop Only, Right Side */}
          <button
            onClick={onEdit}
            className="hidden md:block px-4 py-2 bg-white border border-primary-300 hover:border-primary-500 hover:bg-primary-50 text-primary-600 hover:text-primary-700 font-medium rounded-lg transition-all duration-200 text-xs md:text-sm flex-shrink-0 h-fit"
          >
            ✏️ Edit
          </button>
        </div>

        {/* Mobile Edit Button - Below Info */}
        <button
          onClick={onEdit}
          className="md:hidden px-4 py-2 bg-white border border-primary-300 hover:border-primary-500 hover:bg-primary-50 text-primary-600 hover:text-primary-700 font-medium rounded-lg transition-all duration-200 text-xs self-start"
        >
          ✏️ Edit
        </button>

        {/* Bottom Row - Bio & Social Links */}
        <div className="flex gap-4 justify-between items-end">
          {/* Bio Section - Takes up available space */}
          {profileData?.bio && (
            <div className="flex-1">
              <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                {profileData.bio}
              </p>
            </div>
          )}

          {/* Social Links Preview */}
          {hasSocialLinks && (
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <p className="text-xs text-gray-500 font-medium">Social</p>
              <div className="flex gap-2">
                {profileData.linkedin_url && (
                  <a
                    href={profileData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="LinkedIn"
                  >
                    <span className="text-base">🔵</span>
                  </a>
                )}
                {profileData.github_url && (
                  <a
                    href={profileData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="GitHub"
                  >
                    <span className="text-base">⚫</span>
                  </a>
                )}
                {profileData.website && (
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="Website"
                  >
                    <span className="text-base">🌐</span>
                  </a>
                )}
                {profileData.twitter_url && (
                  <a
                    href={profileData.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="Twitter"
                  >
                    <span className="text-base">🐦</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
