import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    // Fetch overall statistics
    const { data: clicks } = await supabase
      .from('click_events')
      .select('*')
    
    const totalAttempts = clicks?.length || 0
    const successfulAttacks = clicks?.filter(c => c.was_successful_attack).length || 0
    const defendedAttacks = totalAttempts - successfulAttacks
    const successRate = totalAttempts > 0 ? Math.round((successfulAttacks / totalAttempts) * 100) : 0
    
    return NextResponse.json({
      totalAttempts,
      successfulAttacks,
      defendedAttacks,
      successRate,
      mostVulnerable: 'social-media',
      peakTime: '14:00-16:00',
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ 
      totalAttempts: 0,
      successfulAttacks: 0,
      defendedAttacks: 0,
      successRate: 0,
      mostVulnerable: 'unknown',
      peakTime: 'unknown',
    })
  }
}