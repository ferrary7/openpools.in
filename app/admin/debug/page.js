'use client'

import { useState, useEffect } from 'react'

export default function AdminDebugPage() {
  const [profiles, setProfiles] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all profiles
        const profileRes = await fetch('/api/admin/search-users?q=')
        const profileData = await profileRes.json()
        
        setProfiles(profileData.users || [])
        
        // Filter employees
        const empList = (profileData.users || []).filter(u => u.role === 'employee' || u.role === 'intern')
        setEmployees(empList)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Debug: Database Status</h1>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-2 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Total Users in DB: {profiles.length}</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {profiles.map(p => (
              <div key={p.id} className="p-3 bg-gray-50 rounded border">
                <p className="font-medium">{p.full_name}</p>
                <p className="text-sm text-gray-600">{p.email}</p>
                <p className="text-xs">
                  <span className={`px-2 py-1 rounded ${p.role === 'employee' ? 'bg-green-100 text-green-800' : p.role === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                    {p.role}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Employees Only */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Employees: {employees.length}</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {employees.map(e => (
              <div key={e.id} className="p-3 bg-green-50 rounded border border-green-200">
                <p className="font-medium">{e.full_name}</p>
                <p className="text-sm text-gray-600">{e.email}</p>
                <p className="text-xs text-gray-700">
                  Role: <span className="font-semibold">{e.role}</span><br/>
                  Hired: {e.hired_date ? new Date(e.hired_date).toLocaleDateString() : 'N/A'}<br/>
                  Dept: {e.department || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold mb-2">Debugging Steps:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Check if your user appears in "Total Users" section</li>
          <li>Check if they have role='employee' (should be green badge)</li>
          <li>If role='user', then the profiles table wasn't updated - check API logs</li>
          <li>If role='employee', they should appear in "Employees" section</li>
          <li>If not appearing in Employees, there's a filtering issue</li>
        </ol>
      </div>
    </div>
  )
}
