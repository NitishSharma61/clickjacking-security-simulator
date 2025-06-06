import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get analytics data from the database
    const [
      sessionsResult,
      clicksResult,
      credentialsResult,
      learningResult
    ] = await Promise.all([
      supabase.from('simulation_sessions').select('*'),
      supabase.from('click_events').select('*'),
      supabase.from('captured_credentials').select('*'),
      supabase.from('learning_progress').select('*')
    ])

    // Calculate statistics
    const totalSessions = sessionsResult.data?.length || 0
    const totalClicks = clicksResult.data?.length || 0
    const successfulAttacks = clicksResult.data?.filter(click => click.was_successful_attack).length || 0
    const defendedAttacks = totalClicks - successfulAttacks

    // Calculate defense rate
    const defenseRate = totalClicks > 0 ? Math.round((defendedAttacks / totalClicks) * 100) : 0

    // Scenario-specific stats
    const scenarioStats = ['social', 'banking', 'permission'].map(scenario => {
      const scenarioClicks = clicksResult.data?.filter(click => click.scenario_type === scenario) || []
      const scenarioSuccesses = scenarioClicks.filter(click => click.was_successful_attack).length
      const scenarioDefenses = scenarioClicks.length - scenarioSuccesses
      const scenarioDefenseRate = scenarioClicks.length > 0 ? Math.round((scenarioDefenses / scenarioClicks.length) * 100) : 0

      return {
        scenario,
        attempts: scenarioClicks.length,
        successes: scenarioSuccesses,
        defenses: scenarioDefenses,
        defenseRate: scenarioDefenseRate
      }
    })

    // Recent activity (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentClicks = clicksResult.data?.filter(click => 
      new Date(click.timestamp) > twentyFourHoursAgo
    ) || []

    const analytics = {
      overview: {
        totalSessions,
        totalClicks,
        successfulAttacks,
        defendedAttacks,
        defenseRate
      },
      scenarios: scenarioStats,
      recentActivity: {
        last24Hours: recentClicks.length,
        successRate: recentClicks.length > 0 ? 
          Math.round((recentClicks.filter(c => c.was_successful_attack).length / recentClicks.length) * 100) : 0
      },
      credentialCaptures: credentialsResult.data?.length || 0
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'session':
        const { data: sessionData, error: sessionError } = await supabase
          .from('simulation_sessions')
          .insert(data)
        if (sessionError) throw sessionError
        break

      case 'click':
        const { data: clickData, error: clickError } = await supabase
          .from('click_events')
          .insert(data)
        if (clickError) throw clickError
        break

      case 'credential':
        const { data: credentialData, error: credentialError } = await supabase
          .from('captured_credentials')
          .insert(data)
        if (credentialError) throw credentialError
        break

      default:
        return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
  }
}