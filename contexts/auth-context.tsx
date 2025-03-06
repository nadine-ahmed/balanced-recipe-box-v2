"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import { getSupabase } from "@/lib/supabase"

const supabase = getSupabase()

import { useRouter } from "next/navigation"

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  is_admin: boolean
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null; data: any }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data: any }>
  signOut: () => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null; data: any }>
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const setData = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error setting initial data:", error)
      } finally {
        setLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    setData()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          return await createProfile(userId)
        }
        throw error
      }

      setProfile(data)
      return data
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }

  const createProfile = async (userId: string, username: string | null = null) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([{ id: userId, username, avatar_url: null, is_admin: false }])
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          console.log("Profile already exists, fetching existing profile")
          return await fetchProfile(userId)
        }
        throw error
      }
      console.log("Created profile:", data)
      setProfile(data)
      return data
    } catch (error) {
      console.error("Error creating profile:", error)
      return null
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      })
      if (error) throw error
      if (data.user) {
        await createProfile(data.user.id, username)
      }
      console.log("Sign up successful:", data)
      return { error: null, data }
    } catch (error) {
      console.error("Error in signUp:", error)
      return { error: error as Error, data: null }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error("Supabase signIn error:", error)
        return { error, data: null }
      }
      if (data.user) {
        await fetchProfile(data.user.id)
      }
      return { error: null, data }
    } catch (error) {
      console.error("Unexpected error in signIn:", error)
      return { error: error as AuthError, data: null }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      setSession(null)
      router.push("/auth/signin")
    } catch (error) {
      console.error("Error in signOut:", error)
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Error resending confirmation email:", error)
      return { error: error as Error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      return { error: null, data }
    } catch (error) {
      console.error("Error in resetPassword:", error)
      return { error: error as Error, data: null }
    }
  }

  const isAdmin = profile?.is_admin ?? false

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    resendConfirmationEmail,
    resetPassword,
    isAdmin,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

