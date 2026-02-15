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
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isAccepted
      ? 'glass-dark border-white/5 hover:border-white/20'
      : 'bg-[#0A0A0A]/40 border-white/5 border-dashed'
      }`}>
      <div className="flex items-center gap-4">
        {/* Avatar placeholder */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-black font-black italic tracking-tighter shadow-lg ${isCaptain
          ? 'bg-gradient-to-br from-purple-400 to-pink-400'
          : isAccepted
            ? 'bg-white'
            : 'bg-gray-800 text-gray-500 border border-white/5'
          }`}>
          {member.user?.full_name?.charAt(0) || member.email?.charAt(0) || '?'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            {member.user?.full_name ? (
              <Link href={`/user/${member.user.username || member.user.id}`}>
                <span className="font-bold text-white hover:text-purple-400 transition-colors uppercase italic tracking-tight text-sm">
                  {member.user.full_name}
                </span>
              </Link>
            ) : (
              <span className="font-bold text-gray-500 uppercase tracking-tight text-xs">{member.email}</span>
            )}

            {isCaptain && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-purple-500/20">
                CAPTAIN
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            {member.user?.username && (
              <span className="text-[10px] text-gray-600 font-black tracking-widest uppercase">@{member.user.username}</span>
            )}

            {isPending && (
              <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest italic animate-pulse">ENLISTING...</span>
            )}

            {member.is_verified && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-md border border-green-500/20">
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">SIGNAL CLEAR</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {canRemove && !isCaptain && (
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
          title={isPending ? 'Cancel invite' : 'Remove member'}
        >
          {removing ? (
            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}
    </div>)
}
