import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for public operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// Database types for TypeScript support
export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  full_name: string | null
  role: 'student' | 'teacher' | 'admin'
  selected_profession_id: string | null
  activation_code_id: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface ActivationCode {
  id: string
  code: string
  description: string | null
  max_uses: number
  used_count: number
  status: 'active' | 'used' | 'expired'
  expires_at: string | null
  created_by: string | null
  profession_id: string | null
  created_at: string
  updated_at: string
}

export interface Profession {
  id: string
  name: string
  name_en: string
  description: string | null
  icon_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VocabularyCategory {
  id: string
  profession_id: string
  name: string
  name_en: string
  description: string | null
  order_index: number
  created_at: string
}

export interface Vocabulary {
  id: string
  category_id: string
  term_en: string
  term_pl: string
  definition_en: string | null
  definition_pl: string | null
  pronunciation: string | null
  audio_url: string | null
  image_url: string | null
  example_sentence_en: string | null
  example_sentence_pl: string | null
  difficulty_level: number
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  profession_id: string
  title: string
  title_en: string
  description: string | null
  description_en: string | null
  video_url: string
  thumbnail_url: string | null
  duration: number | null
  difficulty_level: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  title: string
  description: string | null
  difficulty_level: number
  created_at: string
  updated_at: string
}
