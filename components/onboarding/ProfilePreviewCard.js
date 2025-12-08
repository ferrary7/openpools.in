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

  return (
    <div className="card bg-gradient-to-br from-primary-50 via-white to-purple-50 border-2 border-primary-200 shadow-lg">
      <div className="flex items-start gap-4">
        {/* Profile Picture */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
          {profileData?.profile_picture_url ? (
            <img
              src={profileData.profile_picture_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-2xl text-gray-900 mb-1">
            {profileData?.full_name || 'Your Name'}
          </h3>

          {profileData?.job_title && profileData?.company && (
            <p className="text-gray-700 font-medium">
              {profileData.job_title} at {profileData.company}
            </p>
          )}

          {profileData?.location && (
            <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profileData.location}
            </p>
          )}

          {profileData?.bio && (
            <p className="text-gray-700 text-sm mt-3 leading-relaxed">
              {profileData.bio}
            </p>
          )}

          {/* Social Links Preview */}
          {(profileData?.linkedin_url || profileData?.github_url || profileData?.website || profileData?.twitter_url) && (
            <div className="flex gap-2 mt-3">
              {profileData.linkedin_url && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs">🔵</span>
                </div>
              )}
              {profileData.github_url && (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs">⚫</span>
                </div>
              )}
              {profileData.website && (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs">🌐</span>
                </div>
              )}
              {profileData.twitter_url && (
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                  <span className="text-xs">🐦</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="flex-shrink-0 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
