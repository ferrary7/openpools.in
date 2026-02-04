import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50/50 relative overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 mix-blend-multiply"></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-blue-50/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10">
        <Navbar user={user} />
        <main>{children}</main>
      </div>
    </div>
  )
}
