import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findTopMatches } from '@/lib/matching'
import { recalculateKeywordWeights } from '@/lib/keywords'

// Disable caching for this endpoint - always fetch fresh data
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user's profile and keywords
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: keywordProfile } = await supabase
      .from('keyword_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profile || !keywordProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 1. TOTAL USERS IN DATABASE
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // 2. USER'S SKILL RANKING (compare keyword count)
    const userKeywordCount = keywordProfile.total_keywords || 0
    const { count: usersWithFewerKeywords } = await supabase
      .from('keyword_profiles')
      .select('*', { count: 'exact', head: true })
      .lt('total_keywords', userKeywordCount)

    const percentile = totalUsers > 0
      ? Math.round((usersWithFewerKeywords / totalUsers) * 100)
      : 50

    // 3. RARE SKILLS - Find skills only few users have
    const keywordsArray = Array.isArray(keywordProfile.keywords) ? keywordProfile.keywords : []
    const userKeywords = keywordsArray.map(k =>
      (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
    )

    // Get all keyword profiles to compare
    const { data: allKeywordProfiles } = await supabase
      .from('keyword_profiles')
      .select('keywords')

    const skillCounts = {}
    allKeywordProfiles?.forEach(kp => {
      const keywordsArray = Array.isArray(kp.keywords) ? kp.keywords : []
      const keywords = keywordsArray.map(k =>
        (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
      )
      keywords.forEach(kw => {
        skillCounts[kw] = (skillCounts[kw] || 0) + 1
      })
    })

    // Find user's rarest skills
    const userSkillRarity = userKeywords.map(skill => ({
      skill,
      count: skillCounts[skill] || 1,
      percentage: ((skillCounts[skill] || 1) / totalUsers * 100).toFixed(1)
    })).sort((a, b) => a.count - b.count)

    const rarestSkills = userSkillRarity.slice(0, 5)
    const topRarestSkill = rarestSkills[0]

    // 4. RARE SKILL COMBINATIONS
    const userSkillSet = new Set(userKeywords.slice(0, 10))
    let rarestCombo = null
    let minComboCount = totalUsers

    // Check combinations of user's top skills
    for (let i = 0; i < userKeywords.slice(0, 5).length; i++) {
      for (let j = i + 1; j < userKeywords.slice(0, 5).length; j++) {
        const skill1 = userKeywords[i]
        const skill2 = userKeywords[j]

        let comboCount = 0
        allKeywordProfiles?.forEach(kp => {
          const keywordsArray = Array.isArray(kp.keywords) ? kp.keywords : []
          const keywords = keywordsArray.map(k =>
            (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
          )
          if (keywords.includes(skill1) && keywords.includes(skill2)) {
            comboCount++
          }
        })

        if (comboCount < minComboCount && comboCount > 0) {
          minComboCount = comboCount
          rarestCombo = {
            skill1,
            skill2,
            count: comboCount,
            percentage: ((comboCount / totalUsers) * 100).toFixed(1)
          }
        }
      }
    }

    // 5. COLLABORATION STATS
    const { data: collabs } = await supabase
      .from('collaborations')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted')

    const collabCount = collabs?.length || 0

    // Get average collaboration count (excluding current user for fair comparison)
    const { data: allCollabs } = await supabase
      .from('collaborations')
      .select('sender_id, receiver_id')
      .eq('status', 'accepted')

    const userCollabCounts = {}
    allCollabs?.forEach(c => {
      userCollabCounts[c.sender_id] = (userCollabCounts[c.sender_id] || 0) + 1
      userCollabCounts[c.receiver_id] = (userCollabCounts[c.receiver_id] || 0) + 1
    })

    // Calculate average excluding current user
    const otherUserCounts = Object.entries(userCollabCounts)
      .filter(([id]) => id !== userId)
      .map(([_, count]) => count)

    const avgCollabs = otherUserCounts.length > 0
      ? Math.round(otherUserCounts.reduce((a, b) => a + b, 0) / otherUserCounts.length)
      : 0

    const collabPercentile = collabCount > avgCollabs
      ? Math.min(95, Math.round((collabCount / (avgCollabs * 2)) * 100))
      : Math.round((collabCount / avgCollabs) * 50)

    // 6. SHOWCASE STATS
    const { data: showcaseItems } = await supabase
      .from('showcase_items')
      .select('*')
      .eq('user_id', userId)
      .eq('visible', true)

    const projectCount = showcaseItems?.filter(s => s.type === 'project').length || 0
    const certCount = showcaseItems?.filter(s => s.type === 'certification').length || 0
    const totalShowcase = showcaseItems?.length || 0

    // 7. DAYS ACTIVE
    const daysActive = profile.created_at
      ? Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24))
      : 0

    // 8. JOURNAL STATS
    const { count: journalCount } = await supabase
      .from('journals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 9. TOP MATCHES
    const { data: matches } = await supabase
      .from('matches')
      .select('compatibility_score')
      .eq('user_id', userId)
      .order('compatibility_score', { ascending: false })
      .limit(5)

    const topMatchScore = matches?.[0]?.compatibility_score || 0
    const highMatchCount = matches?.filter(m => m.compatibility_score >= 90).length || 0

    // 10. SKILL GROWTH TRAJECTORY
    // Get journals with extracted keywords to see evolution
    const { data: journals } = await supabase
      .from('journals')
      .select('created_at, extracted_keywords')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    let skillGrowth = 0
    if (journals && journals.length > 1) {
      const firstJournal = journals[0]
      const firstKeywordCount = firstJournal?.extracted_keywords?.length || 0
      skillGrowth = userKeywordCount - firstKeywordCount
    }

    // 11. SIGNAL CLASSIFICATION (Johari Window approach)
    // Core signals: Skills from first journal (day 1)
    // Recent signals: Skills from last 30 days
    // Hidden signals: Skills not used recently
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentJournals = journals?.filter(j => new Date(j.created_at) >= thirtyDaysAgo) || []
    const recentSkillsSet = new Set()
    recentJournals.forEach(j => {
      (j.extracted_keywords || []).forEach(kw => {
        const keyword = typeof kw === 'string' ? kw : (kw.keyword || kw.name || '')
        if (keyword) recentSkillsSet.add(keyword.toLowerCase())
      })
    })

    const firstJournal = journals?.[0]
    const coreSkillsSet = new Set(
      (firstJournal?.extracted_keywords || []).map(k => {
        const keyword = typeof k === 'string' ? k : (k.keyword || k.name || '')
        return keyword.toLowerCase()
      }).filter(Boolean)
    )

    const coreSignals = []
    const recentSignals = []
    const hiddenSignals = []

    userKeywords.forEach(skill => {
      const skillLower = skill.toLowerCase()

      // Core: Skills from day 1 that are STILL in recent use
      if (coreSkillsSet.has(skillLower) && recentSkillsSet.has(skillLower)) {
        coreSignals.push(skill)
      }
      // Recent: NEW skills (not from day 1, but used in last 30 days)
      else if (!coreSkillsSet.has(skillLower) && recentSkillsSet.has(skillLower)) {
        recentSignals.push(skill)
      }
      // Hidden: Skills NOT used in last 30 days (dormant/forgotten)
      else if (!recentSkillsSet.has(skillLower)) {
        hiddenSignals.push(skill)
      }
    })

    // 12. FIND SIMILAR PROFESSIONALS (using real matching algorithm)
    // Get user's profile data
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Get all other profiles with keywords
    const { data: allProfiles } = await supabase
      .from('keyword_profiles')
      .select(
        `
        user_id,
        keywords,
        profiles:user_id (
          id,
          full_name,
          email,
          username,
          bio,
          location,
          job_title,
          company,
          linkedin_url,
          github_url,
          website
        )
      `
      )
      .neq('user_id', userId)
      .limit(100)

    // Format candidates for matching algorithm
    const candidates = (allProfiles || []).map((profile) => ({
      userId: profile.user_id,
      username: profile.profiles?.username,
      fullName: profile.profiles?.full_name || 'Anonymous',
      email: profile.profiles?.email,
      keywords: profile.keywords,
      profile: {
        full_name: profile.profiles?.full_name,
        bio: profile.profiles?.bio,
        location: profile.profiles?.location,
        job_title: profile.profiles?.job_title,
        company: profile.profiles?.company,
        linkedin_url: profile.profiles?.linkedin_url,
        github_url: profile.profiles?.github_url,
        website: profile.profiles?.website
      }
    }))

    // Apply weight recalculation
    const recalculatedUserKeywords = recalculateKeywordWeights(keywordProfile?.keywords || [])
    const recalculatedCandidates = candidates.map(c => ({
      ...c,
      keywords: recalculateKeywordWeights(c.keywords || [])
    }))

    // Get top 3 matches
    const similarMatches = findTopMatches(
      recalculatedUserKeywords,
      recalculatedCandidates,
      3,
      {
        full_name: userProfile?.full_name,
        bio: userProfile?.bio,
        location: userProfile?.location,
        job_title: userProfile?.job_title,
        company: userProfile?.company,
        linkedin_url: userProfile?.linkedin_url,
        github_url: userProfile?.github_url,
        website: userProfile?.website
      }
    )

    const similarProfessionals = similarMatches.map(match => ({
      userId: match.userId,
      fullName: match.fullName,
      username: match.username,
      email: match.email,
      compatibility: match.compatibility,
      commonKeywords: match.commonKeywords,
      totalCommon: match.totalCommon
    }))

    // 13. COMPLEMENTARY SKILLS ANALYSIS
    // Find skills that frequently appear WITH user's skills (but user doesn't have)
    const skillPairs = {}
    const profilesWithUserSkills = new Set()

    if (allProfiles) {
      allProfiles.forEach(otherProfile => {
        const otherKeywordsArray = Array.isArray(otherProfile.keywords) ? otherProfile.keywords : []
        const otherSkills = otherKeywordsArray.map(k =>
          (typeof k === 'string' ? k : k.keyword || '').toLowerCase()
        )

        // Check if this profile has any of user's skills
        const hasUserSkill = userKeywords.some(userSkill =>
          otherSkills.includes(userSkill.toLowerCase())
        )

        if (hasUserSkill) {
          profilesWithUserSkills.add(otherProfile.user_id)

          // Track what OTHER skills they have (that user doesn't)
          otherSkills.forEach(otherSkill => {
            // Skip if user already has this skill
            if (userKeywords.some(uk => uk.toLowerCase() === otherSkill.toLowerCase())) {
              return
            }

            // Skip garbage/non-technical skills
            const garbage = ['intern', 'cleaning', 'reporting', 'collaborating', 'working', 'managing', 'leading', 'organizing']
            if (garbage.includes(otherSkill.toLowerCase())) {
              return
            }

            skillPairs[otherSkill] = (skillPairs[otherSkill] || 0) + 1
          })
        }
      })
    }

    // Get top complementary skills with CORRECT percentage
    const totalProfilesWithSimilarSkills = profilesWithUserSkills.size
    const complementarySkills = Object.entries(skillPairs)
      .filter(([skill, count]) => count >= 2) // At least 2 people have it
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({
        skill,
        frequency: count,
        percentage: totalProfilesWithSimilarSkills > 0
          ? Math.round((count / totalProfilesWithSimilarSkills) * 100)
          : 0
      }))

    return NextResponse.json({
      totalUsers,
      userMetrics: {
        keywordCount: userKeywordCount,
        percentile,
        rarestSkills,
        topRarestSkill,
        rarestCombo,
        collabCount,
        collabPercentile,
        avgCollabs: Math.round(avgCollabs),
        projectCount,
        certCount,
        totalShowcase,
        daysActive,
        journalCount,
        topMatchScore: Math.round(topMatchScore),
        highMatchCount,
        skillGrowth,
        // New data-driven insights
        signalClassification: {
          core: coreSignals.slice(0, 10),
          recent: recentSignals.slice(0, 10),
          hidden: hiddenSignals.slice(0, 10)
        },
        similarProfessionals: similarProfessionals,
        complementarySkills
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })

  } catch (error) {
    console.error('Error fetching DNA metrics:', error)
    return NextResponse.json({
      error: 'Failed to fetch metrics',
      details: error.message
    }, { status: 500 })
  }
}
