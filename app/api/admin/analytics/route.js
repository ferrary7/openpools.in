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
      return Response.json({ error: 'Admin access required', role: profile?.role }, { status: 403 })
    }

    // Fetch all data from actual tables
    const [
      profilesRes,
      matchesRes,
      messagesRes,
      journalsRes,
      keywordProfilesRes,
      collaborationsRes,
      notificationsRes,
      showcaseRes,
      aiInsightsRes,
      premiumUsersRes
    ] = await Promise.all([
      supabase.from('profiles').select('id, email, resume_url, created_at, bio, location, job_title, company, is_premium, premium_expires_at'),
      supabase.from('matches').select('id, user_id, matched_user_id, compatibility_score'),
      supabase.from('messages').select('id, sender_id, receiver_id, read, created_at'),
      supabase.from('journals').select('id, user_id, title, created_at'),
      supabase.from('keyword_profiles').select('user_id, keywords, total_keywords'),
      supabase.from('collaborations').select('id, sender_id, receiver_id, status, created_at'),
      supabase.from('notifications').select('id, user_id, type, read, created_at'),
      supabase.from('showcase_items').select('id, user_id, type, created_at, visible'),
      supabase.from('ai_insights').select('user_id, generated_at, updated_at'),
      supabase.from('profiles').select('id, premium_expires_at').eq('is_premium', true)
    ])

    const profiles = profilesRes.data || []
    const matches = matchesRes.data || []
    const messages = messagesRes.data || []
    const journals = journalsRes.data || []
    const keywordProfiles = keywordProfilesRes.data || []
    const collaborations = collaborationsRes.data || []
    const notifications = notificationsRes.data || []
    const showcaseItems = showcaseRes.data || []
    const aiInsights = aiInsightsRes.data || []
    const premiumUsers = premiumUsersRes.data || []
    const activePremiumUsers = premiumUsers.filter(p => !p.premium_expires_at || new Date(p.premium_expires_at) > new Date())

    // Log errors from queries
    if (profilesRes.error) console.error('Profiles error:', profilesRes.error)
    if (matchesRes.error) console.error('Matches error:', matchesRes.error)
    if (messagesRes.error) console.error('Messages error:', messagesRes.error)
    if (journalsRes.error) console.error('Journals error:', journalsRes.error)
    if (keywordProfilesRes.error) console.error('Keyword profiles error:', keywordProfilesRes.error)
    if (collaborationsRes.error) console.error('Collaborations error:', collaborationsRes.error)
    if (notificationsRes.error) console.error('Notifications error:', notificationsRes.error)
    if (showcaseRes.error) console.error('Showcase error:', showcaseRes.error)
    if (aiInsightsRes.error) console.error('AI insights error:', aiInsightsRes.error)
    if (premiumUsersRes.error) console.error('Premium users error:', premiumUsersRes.error)

    console.log('Analytics Data:', {
      profiles: profiles.length,
      matches: matches.length,
      messages: messages.length,
      journals: journals.length,
      keywordProfiles: keywordProfiles.length,
      collaborations: collaborations.length,
      notifications: notifications.length,
      showcaseItems: showcaseItems.length,
      aiInsights: aiInsights.length
    })

    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const totalUsers = profiles.length
    const resumesUploaded = profiles.filter(p => p.resume_url).length
    const completeProfiles = profiles.filter(p => p.bio && p.location && p.job_title).length
    const avgProfileCompletion = totalUsers > 0 ? Math.round((completeProfiles / totalUsers) * 100) : 0

    const activeUserIds = new Set()
    matches.filter(m => new Date(m.created_at) > thirtyDaysAgo).forEach(m => {
      activeUserIds.add(m.user_id); activeUserIds.add(m.matched_user_id)
    })
    messages.filter(m => new Date(m.created_at) > thirtyDaysAgo).forEach(m => {
      activeUserIds.add(m.sender_id); activeUserIds.add(m.receiver_id)
    })
    journals.filter(j => new Date(j.created_at) > thirtyDaysAgo).forEach(j => {
      activeUserIds.add(j.user_id)
    })
    const activeUsers = activeUserIds.size

    const avgMatchScore = matches.length > 0
      ? Math.round(matches.reduce((sum, m) => sum + parseFloat(m.compatibility_score || 0), 0) / matches.length)
      : 0

    const conversations = new Set()
    messages.forEach(m => {
      conversations.add([m.sender_id, m.receiver_id].sort().join('-'))
    })

    const allKeywords = []
    keywordProfiles.forEach(kp => {
      if (Array.isArray(kp.keywords)) {
        kp.keywords.forEach(k => {
          allKeywords.push(typeof k === 'string' ? k : k.keyword || '')
        })
      }
    })
    const keywordMap = {}; allKeywords.forEach(kw => { keywordMap[kw] = (keywordMap[kw] || 0) + 1 })
    const topKeywords = Object.entries(keywordMap).map(([keyword, count]) => ({ keyword, count })).sort((a, b) => b.count - a.count).slice(0, 5)

    const acceptedCollabs = collaborations.filter(c => c.status === 'accepted').length
    const collabAcceptanceRate = collaborations.length > 0 ? Math.round((acceptedCollabs / collaborations.length) * 100) : 0

    const showcaseTypeMap = {}
    showcaseItems.forEach(item => { showcaseTypeMap[item.type] = (showcaseTypeMap[item.type] || 0) + 1 })
    const topShowcaseTypes = Object.entries(showcaseTypeMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)

    const jobMap = {}; const companyMap = {}
    profiles.filter(p => p.job_title).forEach(p => { jobMap[p.job_title] = (jobMap[p.job_title] || 0) + 1 })
    profiles.filter(p => p.company).forEach(p => { companyMap[p.company] = (companyMap[p.company] || 0) + 1 })

    const analytics = {
      users: { total: totalUsers, withResume: resumesUploaded, resumesThisMonth: profiles.filter(p => p.resume_url && new Date(p.created_at) > thirtyDaysAgo).length, active30d: activeUsers, activePercent: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0, avgProfileCompletion, completeProfiles, profilesWithBio: profiles.filter(p => p.bio).length, profilesWithLocation: profiles.filter(p => p.location).length, keywordUsersCount: keywordProfiles.length },
      engagement: { totalMatches: matches.length, avgMatchesPerUser: totalUsers > 0 ? Math.round(matches.length / totalUsers) : 0, avgMatchScore, matchesThisMonth: matches.filter(m => new Date(m.created_at) > thirtyDaysAgo).length, activeChats: conversations.size, totalMessages: messages.length, messagesThisMonth: messages.filter(m => new Date(m.created_at) > thirtyDaysAgo).length, unreadMessages: messages.filter(m => !m.read).length, journalEntries: journals.length, journalsThisMonth: journals.filter(j => new Date(j.created_at) > thirtyDaysAgo).length, avgEntriesPerUser: totalUsers > 0 ? Math.round(journals.length / totalUsers) : 0, uniqueJournalUsers: new Set(journals.map(j => j.user_id)).size },
      content: { resumes: resumesUploaded, resumesThisMonth: profiles.filter(p => p.resume_url && new Date(p.created_at) > thirtyDaysAgo).length, totalKeywords: allKeywords.length, avgKeywordsPerUser: keywordProfiles.length > 0 ? Math.round(allKeywords.length / keywordProfiles.length) : 0, topKeywords, keywordUsersCount: keywordProfiles.length, showcaseItems: showcaseItems.length, visibleShowcaseItems: showcaseItems.filter(s => s.visible).length, uniqueShowcaseUsers: new Set(showcaseItems.map(s => s.user_id)).size, topShowcaseTypes, aiInsights: aiInsights.length, aiInsightsThisMonth: aiInsights.filter(a => new Date(a.updated_at) > thirtyDaysAgo).length, premiumUsers: premiumUsers.length, activePremium: activePremiumUsers.length },
      collaboration: { totalRequests: collaborations.length, pending: collaborations.filter(c => c.status === 'pending').length, accepted: acceptedCollabs, rejected: collaborations.filter(c => c.status === 'rejected').length, thisMonth: collaborations.filter(c => new Date(c.created_at) > thirtyDaysAgo).length, acceptanceRate: collabAcceptanceRate, notifications: notifications.length, unreadNotifications: notifications.filter(n => !n.read).length, collabNotifications: notifications.filter(n => n.type === 'collab_request').length },
      activity: { newUsersMonth: profiles.filter(p => new Date(p.created_at) > thirtyDaysAgo).length, newUsersWeek: profiles.filter(p => new Date(p.created_at) > sevenDaysAgo).length, signupRate: totalUsers > 0 ? Math.round((profiles.filter(p => new Date(p.created_at) > thirtyDaysAgo).length / totalUsers) * 100) : 0, dailyAvg: profiles.filter(p => new Date(p.created_at) > sevenDaysAgo).length > 0 ? Math.round(profiles.filter(p => new Date(p.created_at) > sevenDaysAgo).length / 7) : 0, topJobs: Object.entries(jobMap).map(([job, count]) => ({ job, count })).sort((a, b) => b.count - a.count).slice(0, 5), topCompanies: Object.entries(companyMap).map(([company, count]) => ({ company, count })).sort((a, b) => b.count - a.count).slice(0, 5) }
    }

    console.log('Analytics response:', analytics)
    return Response.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
