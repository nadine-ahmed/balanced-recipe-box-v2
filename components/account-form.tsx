"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from 'react-hot-toast'

type Profile = {
  first_name: string | null
  last_name: string | null
  username: string | null
  email: string | null
}

export function AccountForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      if (user) {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, username, email")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          toast.error("Failed to load profile. Please try again.")
        } else if (data) {
          setProfile(data)
        }
      }
      setLoading(false)
    }

    loadProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const supabase = getSupabase()
    const updates = {
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("profiles").upsert(updates)

    if (error) {
      toast.error("Failed to update profile. Please try again.")
    } else {
      toast.success("Profile updated successfully.")
    }
    setLoading(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          name="first_name"
          type="text"
          value={profile.first_name || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          name="last_name"
          type="text"
          value={profile.last_name || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={profile.username || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={profile.email || ""} onChange={handleChange} required />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}

