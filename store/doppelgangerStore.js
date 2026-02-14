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

  // Cache timestamps
  lastFetched: null,
  lastTeamFetched: null,
  lastLeaderboardFetched: null,

  // Setters
  setEvent: (event) => set({ event }),
  setTeam: (team) => set({ team }),
  setMembers: (members) => set({ members }),
  setLogs: (logs) => set({ logs }),
  setSubmission: (submission) => set({ submission }),
  setError: (error) => set({ error }),

  // Fetch active event
  fetchEvent: async (force = false) => {
    const { lastFetched, event } = get()

    if (!force && event && lastFetched) {
      const fiveMinutes = 5 * 60 * 1000
      if (Date.now() - lastFetched < fiveMinutes) {
        return event
      }
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
        lastFetched: Date.now()
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

    if (!force && team?.id === teamId && lastTeamFetched) {
      const oneMinute = 60 * 1000
      if (Date.now() - lastTeamFetched < oneMinute) {
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

      // Refresh team data
      await get().fetchTeam(teamId, true)
      return data.member
    } catch (err) {
      set({ error: err.message })
      return null
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
  reset: () => set({
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
    lastFetched: null,
    lastTeamFetched: null,
    lastLeaderboardFetched: null
  }),

  // Clear error
  clearError: () => set({ error: null })
}))
