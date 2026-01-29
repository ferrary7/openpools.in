'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function TeamPage() {
  const { slug } = useParams()
  const [members, setMembers] = useState([])
  const [pendingInvitations, setPendingInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('recruiter')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState(null)
  const [inviteSuccess, setInviteSuccess] = useState(null)

  // For member actions
  const [actionMember, setActionMember] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchMembers()
    fetchCurrentUserRole()
  }, [slug])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/org/${slug}/members`)
      const data = await response.json()

      if (response.ok) {
        setMembers(data.members || [])
        setPendingInvitations(data.pendingInvitations || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUserRole = async () => {
    try {
      const response = await fetch(`/api/org/${slug}`)
      const data = await response.json()
      if (response.ok && data.organization) {
        setCurrentUserRole(data.organization.userRole)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const response = await fetch(`/api/org/${slug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      setInviteSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      fetchMembers()
    } catch (error) {
      setInviteError(error.message)
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async () => {
    if (!actionMember || !newRole) return
    setUpdating(true)

    try {
      const response = await fetch(`/api/org/${slug}/members/${actionMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }

      fetchMembers()
      setShowRoleModal(false)
      setActionMember(null)
    } catch (error) {
      alert(error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveMember = async (member) => {
    if (!confirm(`Remove ${member.user?.full_name || member.user?.email} from this organization?`)) {
      return
    }

    try {
      const response = await fetch(`/api/org/${slug}/members/${member.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      fetchMembers()
    } catch (error) {
      alert(error.message)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700'
      case 'admin':
        return 'bg-blue-100 text-blue-700'
      case 'recruiter':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500">Manage your organization's team members</p>
        </div>
        {canManageMembers && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="mr-2">+</span>
            Invite Member
          </button>
        )}
      </div>

      {/* Role Descriptions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h3>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-medium text-purple-700">Owner</span>
            <p className="text-gray-500">Full access, can delete org</p>
          </div>
          <div>
            <span className="font-medium text-blue-700">Admin</span>
            <p className="text-gray-500">Manage members & settings</p>
          </div>
          <div>
            <span className="font-medium text-green-700">Recruiter</span>
            <p className="text-gray-500">Search & manage candidates</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Viewer</span>
            <p className="text-gray-500">Read-only access</p>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              {canManageMembers && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.user?.full_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.user?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
                {canManageMembers && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {member.role !== 'owner' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActionMember(member)
                            setNewRole(member.role)
                            setShowRoleModal(true)
                          }}
                          className="text-gray-600 hover:text-black"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Pending Invitations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingInvitations.map((invite) => (
              <div key={invite.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invite.email}</p>
                  <p className="text-sm text-gray-500">
                    Invited as {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {inviteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  {inviteSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="colleague@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="admin">Admin - Full access</option>
                  <option value="recruiter">Recruiter - Can search & manage candidates</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail}
                  className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && actionMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Change Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setActionMember(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Change role for <strong>{actionMember.user?.full_name || actionMember.user?.email}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false)
                    setActionMember(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={updating || newRole === actionMember.role}
                  className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
