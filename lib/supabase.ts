import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SimulationSession = {
  session_id?: string
  user_fingerprint: string
  started_at?: string
  completed_at?: string | null
  device_info?: any
  ip_country?: string
  total_scenarios_completed?: number
  final_score?: number | null
}

export type ClickEvent = {
  event_id?: number
  session_id: string
  scenario_type: 'social' | 'banking' | 'permission'
  timestamp?: string
  click_coordinates: string | { x: number; y: number }
  target_element: 'legitimate' | 'malicious'
  hover_duration_ms?: number
  was_successful_attack: boolean
  user_realized_attack?: boolean
}

export type CapturedCredential = {
  capture_id?: number
  session_id: string
  scenario_id: string
  timestamp?: string
  field_name: 'username' | 'password' | 'card_number' | 'cvv'
  captured_value: string
  keystrokes_timing?: any
  time_to_complete_ms?: number
}

export type LearningProgress = {
  progress_id?: number
  session_id: string
  scenario_type: string
  attempt_number: number
  time_to_understand_ms?: number
  replay_count?: number
  used_transparency_slider?: boolean
  checked_for_attacks_proactively?: boolean
  reflection_answer?: string
}