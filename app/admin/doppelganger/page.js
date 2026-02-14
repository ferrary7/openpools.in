'use client'

import { useEffect, useState, Fragment } from 'react'

export default function DoppelgangerAdminPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState({})
  const [tab, setTab] = useState('submissions') // submissions, all, leaderboard
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedTeams, setExpandedTeams] = useState(new Set())
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    registration_start: '',
    registration_end: '',
    sprint_start: '',
    sprint_end: '',
    submission_deadline: ''
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/doppelganger')
      const data = await res.json()
      setEvents(data.events || [])
      if (data.events?.length > 0) {
        selectEvent(data.events[0].id)
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const createEvent = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin/doppelganger', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setEvents(prev => [data.event, ...prev])
      setSelectedEvent(data.event)
      setShowCreateForm(false)
      setNewEvent({
        name: '',
        description: '',
        registration_start: '',
        registration_end: '',
        sprint_start: '',
        sprint_end: '',
        submission_deadline: ''
      })
      selectEvent(data.event.id)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const selectEvent = async (eventId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/doppelganger?event_id=${eventId}`)
      const data = await res.json()
      setSelectedEvent(data.event)
      setTeams(data.teams || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateEventStatus = async (status) => {
    try {
      const res = await fetch('/api/admin/doppelganger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent.id, status })
      })
      const data = await res.json()
      if (res.ok) {
        setSelectedEvent(data.event)
        setEvents(prev => prev.map(e => e.id === data.event.id ? data.event : e))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteEvent = async () => {
    if (!selectedEvent) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/doppelganger?event_id=${selectedEvent.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Remove from events list
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
      setTeams([])
      setSelectedEvent(events.length > 1 ? events.find(e => e.id !== selectedEvent.id) : null)
      setShowDeleteConfirm(false)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleScore = (teamId, field, value) => {
    setScoring(prev => ({ ...prev, [teamId]: { ...prev[teamId], [field]: value } }))
  }

  const submitScore = async (teamId, runSynergy = false) => {
    const teamScores = scoring[teamId] || {}
    setScoring(prev => ({ ...prev, [teamId]: { ...prev[teamId], saving: true } }))

    try {
      const res = await fetch('/api/admin/doppelganger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          technical_score: teamScores.technical_score,
          social_score: teamScores.social_score,
          run_synergy: runSynergy
        })
      })
      const data = await res.json()
      if (res.ok) {
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, score: data.score } : t))
        setScoring(prev => ({ ...prev, [teamId]: { ...prev[teamId], saving: false, saved: true } }))
        setTimeout(() => setScoring(prev => ({ ...prev, [teamId]: { ...prev[teamId], saved: false } })), 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setScoring(prev => ({ ...prev, [teamId]: { ...prev[teamId], saving: false } }))
    }
  }

  const teamsWithSubmissions = teams.filter(t => t.submission)
  const sortedByScore = [...teamsWithSubmissions].sort((a, b) => (b.score?.final_score || 0) - (a.score?.final_score || 0))

  const toggleTeamExpand = (teamId) => {
    setExpandedTeams(prev => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      registration: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      judging: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-purple-100 text-purple-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading && !selectedEvent) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doppelganger Events</h1>
          <p className="text-gray-500">Manage events, judge submissions, announce winners</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
        >
          + Create Event
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Delete Event</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div>
                  <p className="font-semibold text-red-800">This action cannot be undone</p>
                  <p className="text-sm text-red-600">All teams, submissions, and scores will be permanently deleted.</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{selectedEvent.name}</strong>?
              </p>
              <div className="text-sm text-gray-500 mb-4">
                This will delete:
                <ul className="list-disc ml-5 mt-1">
                  <li>{teams.length} teams</li>
                  <li>{teamsWithSubmissions.length} submissions</li>
                  <li>All progress logs and scores</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteEvent}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Create New Event</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={createEvent} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  value={newEvent.name}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Doppelganger Sprint 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Start *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.registration_start}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, registration_start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration End *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.registration_end}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, registration_end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Start *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.sprint_start}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, sprint_start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sprint End *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.sprint_end}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, sprint_end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={newEvent.submission_deadline}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, submission_deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Selector */}
      {events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Event:</label>
            <select
              value={selectedEvent?.id || ''}
              onChange={(e) => selectEvent(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>

            {selectedEvent && (
              <>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </span>

                <div className="flex gap-2 ml-auto">
                  {selectedEvent.status === 'draft' && (
                    <button onClick={() => updateEventStatus('registration')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                      Open Registration
                    </button>
                  )}
                  {selectedEvent.status === 'registration' && (
                    <button onClick={() => updateEventStatus('active')} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">
                      Start Sprint
                    </button>
                  )}
                  {selectedEvent.status === 'active' && (
                    <button onClick={() => updateEventStatus('judging')} className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm">
                      Start Judging
                    </button>
                  )}
                  {selectedEvent.status === 'judging' && (
                    <button onClick={() => updateEventStatus('completed')} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">
                      Complete & Announce Winners
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                  >
                    Delete Event
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {selectedEvent && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{teams.length}</div>
            <div className="text-sm text-gray-500">Total Teams</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{teamsWithSubmissions.length}</div>
            <div className="text-sm text-gray-500">Submissions</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {teams.filter(t => t.problem_statement).length}
            </div>
            <div className="text-sm text-gray-500">With Problems</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {teamsWithSubmissions.filter(t => t.score?.final_score).length}
            </div>
            <div className="text-sm text-gray-500">Scored</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {selectedEvent && (
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'submissions', label: `Submissions (${teamsWithSubmissions.length})` },
            { id: 'all', label: `All Teams (${teams.length})` },
            { id: 'leaderboard', label: 'Leaderboard' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : tab === 'submissions' ? (
        <div className="space-y-4">
          {teamsWithSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
              No submissions yet
            </div>
          ) : (
            teamsWithSubmissions.map(team => {
              const ts = scoring[team.id] || {}
              const currentTechnical = ts.technical_score ?? team.score?.technical_score ?? ''
              const currentSocial = ts.social_score ?? team.score?.social_score ?? ''

              return (
                <div key={team.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">
                        {team.creator?.full_name} • {team.members?.filter(m => m.invite_status === 'accepted').length} members • {team.logs?.length || 0}/5 logs
                      </p>
                    </div>
                    {team.score?.final_score != null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{team.score.final_score.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Final Score</div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Submission Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Submission</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Prototype: </span>
                            <a href={team.submission.prototype_url} target="_blank" className="text-purple-600 hover:underline break-all">
                              {team.submission.prototype_url}
                            </a>
                          </div>
                          {team.submission.social_post_url && (
                            <div>
                              <span className="text-gray-500">Social: </span>
                              <a href={team.submission.social_post_url} target="_blank" className="text-purple-600 hover:underline break-all">
                                {team.submission.social_post_url}
                              </a>
                            </div>
                          )}
                          {team.submission.prototype_description && (
                            <div>
                              <span className="text-gray-500">Description: </span>
                              <p className="text-gray-700 mt-1">{team.submission.prototype_description}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {team.problem_statement && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h5 className="text-xs uppercase tracking-wider text-purple-600 mb-1">Problem</h5>
                          <p className="font-semibold text-gray-800">{team.problem_statement.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{team.problem_statement.challenge}</p>
                        </div>
                      )}

                      {/* Progress Logs */}
                      {team.logs && team.logs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Progress Logs ({team.logs.length}/5)</h4>
                          <div className="space-y-2">
                            {team.logs.sort((a, b) => a.checkpoint_number - b.checkpoint_number).map(log => (
                              <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded text-xs font-bold flex items-center justify-center">
                                      {log.checkpoint_number}
                                    </span>
                                    <span className="font-medium text-gray-800 text-sm">{log.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {log.is_late && (
                                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">Late</span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {new Date(log.submitted_at).toLocaleDateString()} {new Date(log.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{log.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Scoring */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Scoring</h4>

                      {/* Auto Scores */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500">Consistency (20%)</div>
                          <div className="font-bold text-gray-800">
                            {team.score?.consistency_score?.toFixed(0) || ((team.logs?.length || 0) / 5 * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-400">{team.logs?.length || 0}/5 logs</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500">Synergy (25%)</div>
                          <div className="font-bold text-gray-800">{team.score?.synergy_score?.toFixed(0) || '—'}</div>
                          <button
                            onClick={() => submitScore(team.id, true)}
                            disabled={ts.saving}
                            className="text-xs text-purple-600 hover:underline"
                          >
                            {ts.saving ? 'Running...' : 'Run AI Analysis'}
                          </button>
                        </div>
                      </div>

                      {/* Manual Scores */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500">Technical (35%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentTechnical}
                            onChange={(e) => handleScore(team.id, 'technical_score', e.target.value ? Number(e.target.value) : null)}
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="0-100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Social Proof (20%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentSocial}
                            onChange={(e) => handleScore(team.id, 'social_score', e.target.value ? Number(e.target.value) : null)}
                            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="0-100"
                          />
                        </div>
                        <button
                          onClick={() => submitScore(team.id, false)}
                          disabled={ts.saving}
                          className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
                        >
                          {ts.saving ? 'Saving...' : ts.saved ? '✓ Saved!' : 'Save Scores'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : tab === 'all' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Team</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Captain</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Members</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Logs</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams.map(team => (
                <Fragment key={team.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleTeamExpand(team.id)}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${expandedTeams.has(team.id) ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {team.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{team.creator?.full_name}</td>
                    <td className="px-4 py-3 text-center">{team.members?.filter(m => m.invite_status === 'accepted').length || 0}</td>
                    <td className="px-4 py-3 text-center">
                      {team.is_verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Verified</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{team.logs?.length || 0}/5</td>
                    <td className="px-4 py-3 text-center">
                      {team.submission ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Yes</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">No</span>
                      )}
                    </td>
                  </tr>
                  {expandedTeams.has(team.id) && (
                    <tr key={`${team.id}-logs`}>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        {team.logs && team.logs.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Progress Logs</h4>
                            <div className="grid gap-2">
                              {team.logs.sort((a, b) => a.checkpoint_number - b.checkpoint_number).map(log => (
                                <div key={log.id} className="p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded text-xs font-bold flex items-center justify-center">
                                        {log.checkpoint_number}
                                      </span>
                                      <span className="font-medium text-gray-800">{log.title}</span>
                                      {log.is_late && (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">Late</span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {new Date(log.submitted_at).toLocaleDateString()} {new Date(log.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{log.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No progress logs submitted yet</p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Leaderboard */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {sortedByScore.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No scored submissions yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-16">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Team</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Synergy</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Consistency</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Technical</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Social</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedByScore.map((team, i) => (
                  <tr key={team.id} className={i < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.creator?.full_name}</div>
                    </td>
                    <td className="px-4 py-3 text-center">{team.score?.synergy_score?.toFixed(0) || '—'}</td>
                    <td className="px-4 py-3 text-center">{team.score?.consistency_score?.toFixed(0) || '—'}</td>
                    <td className="px-4 py-3 text-center">{team.score?.technical_score?.toFixed(0) || '—'}</td>
                    <td className="px-4 py-3 text-center">{team.score?.social_score?.toFixed(0) || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-purple-600">{team.score?.final_score?.toFixed(1) || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
