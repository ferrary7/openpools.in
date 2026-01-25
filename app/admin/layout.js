'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }) {
  // Sidebar open on desktop, closed on mobile by default
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarMargin, setSidebarMargin] = useState('')
  const router = useRouter()

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

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Employees', href: '/admin/employees', icon: '👥' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed z-40 inset-y-0 left-0 ${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden md:static md:w-64 md:relative md:block`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">OpenPools</h1>}
          <span className="text-gray-400 cursor-pointer md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✖' : '☰'}
          </span>
        </div>

        {/* Admin Badge */}
        <div className="px-4 py-2">
          <div className="bg-primary-600 rounded-lg p-2 text-center text-sm font-semibold">
            {sidebarOpen ? '🔐 Admin Panel' : '🔐'}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={() => router.push('/api/auth/logout')}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto"> 
        {/* Mobile Top Nav */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700 text-2xl focus:outline-none">
            ☰
          </button>
          <h2 className="text-lg font-bold text-gray-800">Admin Dashboard</h2>
          <button className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
            🔔
          </button>
        </div>
        {/* Desktop Top Nav */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 hidden md:flex justify-between items-center sticky top-0 z-30">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              🔔 Notifications
            </button>
          </div>
        </div>
        {/* Page Content */}
        <div className="pt-2 px-2 sm:px-4 md:px-6 pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}
