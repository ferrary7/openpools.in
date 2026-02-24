import { create } from 'zustand'

export const useDoppelgangerStore = create((set, get) => ({
  // State
  event: null,
  team: null,
  members: [],
  logs: [],
  submission: null,
  leaderboard: [],

  // Loading states
  loading: false,
  loadingTeam: false,
  loadingMembers: false,
  loadingLogs: false,
  loadingLeaderboard: false,

  // Error state
  error: null,

  // Polling
  _pollInterval: null,
  _leaderboardPollInterval: null,

  // Setters
  setEvent: (event) => set({ event }),
  setTeam: (team) => set({ team }),
  setMembers: (members) => set({ members }),
  setLogs: (logs) => set({ logs }),
  setSubmission: (submission) => set({ submission }),
  setError: (error) => set({ error }),

  // Start polling team data every N seconds
  startPolling: (teamId, intervalMs = 10000) => {
    const { _pollInterval } = get()
    if (_pollInterval) clearInterval(_pollInterval)

    const poll = () => {
      get()._silentFetchTeam(teamId)
    }

    const interval = setInterval(poll, intervalMs)
    set({ _pollInterval: interval })
  },

  // Stop polling
  stopPolling: () => {
    const { _pollInterval } = get()
    if (_pollInterval) {
      clearInterval(_pollInterval)
      set({ _pollInterval: null })
    }
  },

  // Start polling leaderboard data
  startLeaderboardPolling: (eventId, intervalMs = 15000) => {
    const { _leaderboardPollInterval } = get()
    if (_leaderboardPollInterval) clearInterval(_leaderboardPollInterval)

    const poll = () => {
      get()._silentFetchLeaderboard(eventId)
    }

    const interval = setInterval(poll, intervalMs)
    set({ _leaderboardPollInterval: interval })
  },

  // Stop polling leaderboard
  stopLeaderboardPolling: () => {
    const { _leaderboardPollInterval } = get()
    if (_leaderboardPollInterval) {
      clearInterval(_leaderboardPollInterval)
      set({ _leaderboardPollInterval: null })
    }
  },

  // Silent leaderboard fetch (used by polling) — also checks event status
  _silentFetchLeaderboard: async (eventId) => {
    try {
      const [lbRes, evtRes] = await Promise.all([
        fetch(`/api/doppelganger/leaderboard?event_id=${eventId}`),
        fetch('/api/doppelganger')
      ])
      const lbData = await lbRes.json()
      const evtData = await evtRes.json()

      if (!lbRes.ok) return

      const current = get()
      const newLeaderboard = lbData.leaderboard || []
      const updates = {}

      if (JSON.stringify(current.leaderboard) !== JSON.stringify(newLeaderboard)) {
        updates.leaderboard = newLeaderboard
        updates.lastLeaderboardFetched = Date.now()
      }

      if (evtRes.ok && evtData.event) {
        const newEvent = evtData.event
        if (JSON.stringify(current.event) !== JSON.stringify(newEvent)) {
          updates.event = newEvent
        }
      }

      if (Object.keys(updates).length > 0) {
        set(updates)
      }
    } catch {
      // Silent fail
    }
  },

  // Silent fetch — updates state without loading spinners (used by polling)
  _silentFetchTeam: async (teamId) => {
    try {
      const response = await fetch(`/api/doppelganger/teams/${teamId}`)
      const data = await response.json()

      if (!response.ok) return

      const current = get()
      const newTeam = data.team
      const newMembers = newTeam.members || []
      const newLogs = newTeam.logs || []
      const newSubmission = newTeam.submission || null

      // Only update state if data actually changed (avoids unnecessary re-renders)
      const teamChanged = JSON.stringify(current.team) !== JSON.stringify(newTeam)
      const membersChanged = JSON.stringify(current.members) !== JSON.stringify(newMembers)
      const logsChanged = JSON.stringify(current.logs) !== JSON.stringify(newLogs)
      const submissionChanged = JSON.stringify(current.submission) !== JSON.stringify(newSubmission)

      if (teamChanged || membersChanged || logsChanged || submissionChanged) {
        set({
          team: newTeam,
          members: newMembers,
          logs: newLogs,
          submission: newSubmission,
          lastTeamFetched: Date.now()
        })
      }
    } catch {
      // Silent fail — polling errors shouldn't disrupt the UI
    }
  },

  // Fetch active event
  fetchEvent: async (force = false) => {
    const { event } = get()

    if (!force && event) {
      return event
    }

    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/doppelganger')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch event')
      }

      set({
        event: data.event,
        team: data.userTeam || null,
      })

      return data.event
    } catch (err) {
      set({ error: err.message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  // Fetch team with details
  fetchTeam: async (teamId, force = false) => {
    const { lastTeamFetched, team } = get()

    if (!force && team?.name === decodeURIComponent(teamId) && lastTeamFetched) {
      const tenSeconds = 10 * 1000
      if (Date.now() - lastTeamFetched < tenSeconds) {
        return team
      }
    }

    set({ loadingTeam: true, error: null })

    try {
      const response = await fetch(`/api/doppelganger/teams/${teamId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch team')
      }

      set({
        team: data.team,
        members: data.team.members || [],
        logs: data.team.logs || [],
        submission: data.team.submission || null,
        lastTeamFetched: Date.now()
      })

      return data.team
    } catch (err) {
      set({ error: err.message })
      return null
    } finally {
      set({ loadingTeam: false })
    }
  },

  // Create team
  createTeam: async (name, eventId) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/doppelganger/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, event_id: eventId })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team')
      }

      set({ team: data.team })
      return data.team
    } catch (err) {
      set({ error: err.message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  // Invite member
  inviteMember: async (teamId, email) => {
    set({ loadingMembers: true, error: null })

    try {
      const response = await fetch(`/api/doppelganger/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite member')
      }

      await get().fetchTeam(teamId, true)
      return data.member
    } catch (err) {
      set({ error: err.message })
      return null
    } finally {
      set({ loadingMembers: false })
    }
  },

  // Remove member or cancel invite
  removeMember: async (teamId, memberId) => {
    set({ loadingMembers: true, error: null })

    try {
      const response = await fetch(`/api/doppelganger/teams/${teamId}/members?member_id=${memberId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      await get().fetchTeam(teamId, true)
      return true
    } catch (err) {
      set({ error: err.message })
      return false
    } finally {
      set({ loadingMembers: false })
    }
  },

  // Generate problem statement
  generateProblem: async (teamId) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch(`/api/doppelganger/teams/${teamId}/problem`, {
        method: 'POST'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate problem')
      }

      await get().fetchTeam(teamId, true)
      return data.problem
    } catch (err) {
      set({ error: err.message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  // Submit progress log
  submitLog: async (teamId, checkpointNumber, title, content) => {
    set({ loadingLogs: true, error: null })

    try {
      const response = await fetch(`/api/doppelganger/teams/${teamId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpoint_number: checkpointNumber, title, content })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit log')
      }

      await get().fetchTeam(teamId, true)
      return data.log
    } catch (err) {
      set({ error: err.message })
      return null
    } finally {
      set({ loadingLogs: false })
    }
  },

  // Submit final submission
  submitProject: async (teamId, submissionData) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch(`/api/doppelganger/teams/${teamId}/submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit project')
      }

      set({ submission: data.submission })
      await get().fetchTeam(teamId, true)
      return data.submission
    } catch (err) {
      set({ error: err.message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  // Fetch leaderboard
  fetchLeaderboard: async (eventId, force = false) => {
    const { lastLeaderboardFetched, leaderboard } = get()

    if (!force && leaderboard.length > 0 && lastLeaderboardFetched) {
      const twoMinutes = 2 * 60 * 1000
      if (Date.now() - lastLeaderboardFetched < twoMinutes) {
        return leaderboard
      }
    }

    set({ loadingLeaderboard: true, error: null })

    try {
      const response = await fetch(`/api/doppelganger/leaderboard?event_id=${eventId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }

      set({
        leaderboard: data.leaderboard || [],
        lastLeaderboardFetched: Date.now()
      })
      return data.leaderboard
    } catch (err) {
      set({ error: err.message })
      return []
    } finally {
      set({ loadingLeaderboard: false })
    }
  },

  // Reset store
  reset: () => {
    get().stopPolling()
    get().stopLeaderboardPolling()
    set({
      event: null,
      team: null,
      members: [],
      logs: [],
      submission: null,
      leaderboard: [],
      loading: false,
      loadingTeam: false,
      loadingMembers: false,
      loadingLogs: false,
      loadingLeaderboard: false,
      error: null,
      lastTeamFetched: null,
      lastLeaderboardFetched: null
    })
  },

  // Clear error
  clearError: () => set({ error: null })
}))
