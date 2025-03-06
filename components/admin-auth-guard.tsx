"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/admin/login")
    }
    // TODO: Check if the user has admin privileges
  }, [user, router])

  if (!user) {
    return null
  }

  return <>{children}</>
}

