'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MemberCard({ member, isCaptain = false, canRemove = false, onRemove }) {
  const [removing, setRemoving] = useState(false)
  const isAccepted = member.invite_status === 'accepted'
  const isPending = member.invite_status === 'pending'

  const handleRemove = async () => {
    setRemoving(true)
    try {
      await onRemove?.(member.id)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${isAccepted
      ? 'bg-white/[0.03] border border-white/5 hover:border-white/15'
      : 'border border-dashed border-white/10'
      }`}>
      <div className="flex items-center gap-3">
        {member.user?.profile_picture_url ? (
          <img
            src={member.user.profile_picture_url}
            alt={member.user?.full_name || 'User'}
            className={`w-10 h-10 rounded-xl object-cover shrink-0 ${isCaptain
              ? 'ring-2 ring-primary-500'
              : isAccepted
                ? 'ring-1 ring-white/20'
                : 'ring-1 ring-white/10'
              }`}
          />
        ) : (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${isCaptain
            ? 'bg-primary-500 text-white'
            : isAccepted
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-gray-500'
            }`}>
            {member.user?.full_name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {member.user?.full_name ? (
              <Link href={`/user/${member.user.username || member.user.id}`}>
                <span className="text-sm font-semibold text-white hover:text-primary-400 transition-colors truncate">
                  {member.user.full_name}
                </span>
              </Link>
            ) : (
              <span className="text-sm text-gray-500 truncate">{member.email}</span>
            )}

            {isCaptain && (
              <span className="px-2 py-0.5 bg-primary-500/15 text-primary-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                Lead
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {member.user?.username && (
              <span className="text-xs text-gray-600">@{member.user.username}</span>
            )}

            {isPending && (
              <span className="text-[10px] text-amber-500/80 font-medium">Invited</span>
            )}

            {member.is_verified && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500/80 font-medium">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {canRemove && !isCaptain && (
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
          title={isPending ? 'Cancel invite' : 'Remove member'}
        >
          {removing ? (
            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
