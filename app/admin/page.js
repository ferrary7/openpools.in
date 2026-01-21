import { createClient } from '@/lib/supabase/server'
import OnboardedUsersTable from '@/components/admin/OnboardedUsersTable'
import OnboardingInsights from '@/components/admin/OnboardingInsights'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalEmployees } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('role', ['employee', 'intern'])

  const { count: totalAdmins } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('admin_activity_logs')
    .select(`
      id,
      action,
      resource_type,
      created_at,
      profiles:admin_id (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: '👥', color: 'bg-blue-500' },
    { label: 'Employees', value: totalEmployees, icon: '💼', color: 'bg-green-500' },
    { label: 'Admins', value: totalAdmins, icon: '🔐', color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, employees, and track company metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value || 0}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3 text-white text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/employees"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <span className="text-3xl">👥</span>
            <p className="font-semibold text-gray-900 mt-2">Manage Employees</p>
            <p className="text-sm text-gray-600">Hire, update, and manage staff</p>
          </a>

          <a
            href="/admin/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <span className="text-3xl">📈</span>
            <p className="font-semibold text-gray-900 mt-2">View Analytics</p>
            <p className="text-sm text-gray-600">Company metrics and insights</p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <p className="text-gray-900 font-medium">
                    {log.profiles?.full_name || 'Unknown'} - {log.action}
                  </p>
                  <p className="text-sm text-gray-600">
                    {log.resource_type && `Resource: ${log.resource_type}`}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No activity yet</p>
          )}
        </div>
      </div>

      {/* Onboarding Insights */}
      <OnboardingInsights />

      {/* Onboarded Users Table */}
      <OnboardedUsersTable />
    </div>
  )
}
