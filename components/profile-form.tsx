"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

type Profile = {
  first_name: string | null
  last_name: string | null
  username: string | null
  bio: string | null
}

export function ProfileForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    username: "",
    avatar_url: "",
    bio: "",
  })

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, username, bio")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          toast({
            title: "Error",
            description: "Failed to load profile. Please try again.",
            variant: "destructive",
          })
        } else if (data) {
          setProfile(data)
        }
      }
    }

    loadProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const updates = {
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("profiles").upsert(updates)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={profile.first_name || ""}
            onChange={handleChange}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={profile.last_name || ""}
            onChange={handleChange}
            placeholder="Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email || ""} disabled placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={profile.username || ""}
            onChange={handleChange}
            placeholder="johndoe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={profile.bio || ""}
          onChange={handleChange}
          placeholder="Tell us about yourself"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update profile"}
      </Button>
    </form>
  )
}

