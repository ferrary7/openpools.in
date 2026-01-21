import { createClient } from '@/lib/supabase/server'

export async function GET(req) {
  try {
    const supabase = await createClient()

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get current date info
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of current week (Sunday)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Target: 2000 by March 31st
    const targetDate = new Date(now.getFullYear(), 2, 31) // March 31st
    const targetCount = 2000

    // Get total onboarded users (have full_name - considered completed onboarding)
    const { count: totalOnboarded } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('full_name', 'is', null)

    // Get today's onboardings
    const { data: todayOnboardings } = await supabase
      .from('profiles')
      .select('id, created_at')
      .not('full_name', 'is', null)
      .gte('created_at', today.toISOString())
      .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())

    // Get this week's onboardings
    const { data: weekOnboardings } = await supabase
      .from('profiles')
      .select('id, created_at')
      .not('full_name', 'is', null)
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', today.toISOString())

    // Get this month's onboardings
    const { data: monthOnboardings } = await supabase
      .from('profiles')
      .select('id, created_at')
      .not('full_name', 'is', null)
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', today.toISOString())

    const todayCount = todayOnboardings?.length || 0
    const weekCount = weekOnboardings?.length || 0
    const monthCount = monthOnboardings?.length || 0

    // Calculate progress to target
    const progressPercent = Math.min(Math.round((totalOnboarded / targetCount) * 100), 100)
    const remainingToTarget = Math.max(0, targetCount - totalOnboarded)
    const daysUntilTarget = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24))

    // Calculate daily rate needed
    const dailyRateNeeded = daysUntilTarget > 0 ? Math.ceil(remainingToTarget / daysUntilTarget) : 0

    return Response.json({
      insights: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        total: totalOnboarded || 0
      },
      target: {
        goal: targetCount,
        current: totalOnboarded || 0,
        remaining: remainingToTarget,
        progressPercent,
        targetDate: targetDate.toISOString().split('T')[0],
        daysRemaining: daysUntilTarget,
        dailyRateNeeded
      }
    })
  } catch (error) {
    console.error('Onboarding insights error:', error)
    return Response.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const supabase = await createClient()

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { targetCount, targetDate } = await req.json()

    // Update or insert onboarding target
    const { data, error } = await supabase
      .from('company_targets')
      .upsert({
        metric: 'onboarding_target',
        target_value: targetCount,
        period: targetDate,
        owner_id: user.id,
        status: 'in_progress'
      }, {
        onConflict: 'metric'
      })

    if (error) throw error

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Error updating target:', error)
    return Response.json({ error: 'Failed to update target' }, { status: 500 })
  }
}
