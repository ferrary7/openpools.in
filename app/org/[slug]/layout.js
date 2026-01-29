'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useParams } from 'next/navigation'

export default function OrgLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const { slug } = params

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          setSidebarOpen(false)
        } else {
          setSidebarOpen(true)
        }
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (slug) {
      fetchOrganization()
    }
  }, [slug])

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/org/${slug}`)
      const data = await response.json()

      if (!response.ok) {
        router.push('/org')
        return
      }

      setOrg(data.organization)
    } catch (error) {
      console.error('Error fetching organization:', error)
      router.push('/org')
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { name: 'Dashboard', href: `/org/${slug}`, icon: '📊' },
    { name: 'Candidates', href: `/org/${slug}/candidates`, icon: '👥' },
    { name: 'Search', href: `/org/${slug}/search`, icon: '🔍' },
    { name: 'Jobs', href: `/org/${slug}/jobs`, icon: '💼' },
    { name: 'Team', href: `/org/${slug}/team`, icon: '🤝' },
    { name: 'Settings', href: `/org/${slug}/settings`, icon: '⚙️' },
  ]

  const isActive = (href) => {
    if (href === `/org/${slug}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed z-40 inset-y-0 left-0 ${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden md:static md:w-64 md:relative md:block`}>
        {/* Logo & Org Name */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center">
              {org?.logo_url ? (
                <img
                  src={org.logo_url}
                  alt={org.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-sm font-bold">
                  {org?.name?.charAt(0) || 'O'}
                </div>
              )}
              <span className="ml-3 font-semibold truncate">{org?.name}</span>
            </div>
          )}
          <span className="text-gray-400 cursor-pointer md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✖' : '☰'}
          </span>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-2">
          <div className={`rounded-lg p-2 text-center text-sm font-semibold ${
            org?.userRole === 'owner'
              ? 'bg-purple-600'
              : org?.userRole === 'admin'
              ? 'bg-blue-600'
              : org?.userRole === 'recruiter'
              ? 'bg-green-600'
              : 'bg-gray-600'
          }`}>
            {sidebarOpen ? `🏢 ${org?.userRole || 'member'}` : '🏢'}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer Links */}
        <div className="border-t border-gray-700 p-4 space-y-2">
          <Link
            href="/org"
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm"
          >
            <span className="text-xl">🔄</span>
            {sidebarOpen && <span>Switch Org</span>}
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm"
          >
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span>Back to OpenPools</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Top Nav */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700 text-2xl focus:outline-none">
            ☰
          </button>
          <h2 className="text-lg font-bold text-gray-800 truncate">{org?.name}</h2>
          <div className="w-8"></div>
        </div>

        {/* Desktop Top Nav */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 hidden md:flex justify-between items-center sticky top-0 z-30">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{org?.name}</h2>
            <p className="text-sm text-gray-500">Organization Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {org?.stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-gray-900">{org.stats.candidates}</div>
                  <div className="text-gray-500">Candidates</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{org.stats.activeJobs}</div>
                  <div className="text-gray-500">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{org.stats.members}</div>
                  <div className="text-gray-500">Team</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
