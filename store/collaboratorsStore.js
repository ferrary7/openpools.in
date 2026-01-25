import { create } from 'zustand'

export const useCollaboratorsStore = create((set, get) => ({
  // State
  collaborators: [],
  loading: false,
  error: null,
  searchQuery: '',
  currentUserId: null,
  removing: null,
  lastFetched: null,

  // Actions
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCurrentUserId: (currentUserId) => set({ currentUserId }),
  setRemoving: (removing) => set({ removing }),

  getCollaboratorInfo: (collab) => {
    const { currentUserId } = get()
    const isSender = collab.sender_id === currentUserId
    const collaborator = isSender ? collab.receiver : collab.sender
    return collaborator || {}
  },

  getFilteredCollaborators: () => {
    const { collaborators, searchQuery, getCollaboratorInfo } = get()
    if (!searchQuery) return collaborators

    const searchLower = searchQuery.toLowerCase()
    return collaborators.filter((collab) => {
      const collaborator = getCollaboratorInfo(collab)
      return (
        collaborator.full_name?.toLowerCase().includes(searchLower) ||
        collaborator.email?.toLowerCase().includes(searchLower) ||
        collaborator.company?.toLowerCase().includes(searchLower) ||
        collaborator.job_title?.toLowerCase().includes(searchLower)
      )
    })
  },

  fetchCollaborators: async (force = false) => {
    const { lastFetched, collaborators } = get()

    // Skip fetch if we have data and it's less than 5 minutes old (unless forced)
    if (!force && collaborators.length > 0 && lastFetched) {
      const fiveMinutes = 5 * 60 * 1000
      if (Date.now() - lastFetched < fiveMinutes) {
        return
      }
    }

    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/collabs')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch collaborators')
      }

      const activeCollabs = data.active || []
      set({
        collaborators: activeCollabs,
        lastFetched: Date.now()
      })
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  removeCollaborator: async (collabId, collaboratorName) => {
    if (!confirm(`Are you sure you want to remove your collaboration with ${collaboratorName}? This will delete all your messages and you'll need to send a new request to collaborate again.`)) {
      return false
    }

    set({ removing: collabId })

    try {
      const response = await fetch(`/api/collabs/${collabId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove collaboration')
      }

      // Wait a bit for database to commit
      await new Promise(resolve => setTimeout(resolve, 500))

      // Remove from local state
      set(state => ({
        collaborators: state.collaborators.filter(c => c.id !== collabId)
      }))

      alert('Connection removed successfully')
      return true
    } catch (err) {
      alert('Error removing connection: ' + err.message)
      return false
    } finally {
      set({ removing: null })
    }
  },

  clearSearch: () => set({ searchQuery: '' })
}))
