import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

let supabaseInstance: SupabaseClient | null = null

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseInstance
}

// For backwards compatibility
export const getSupabaseClient = getSupabase

// For direct use when you don't need to ensure SSR compatibility
export const supabase = getSupabase()

// For use in SSR contexts
export function createServerSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

