import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'

export default async function DNALayout({ children }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {user && <Navbar user={user} />}
      <main>{children}</main>
    </div>
  )
}
