"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"

const SupabaseContext = createContext<SupabaseClient | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => getSupabaseClient())

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {})
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}

