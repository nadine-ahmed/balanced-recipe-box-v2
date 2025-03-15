"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AccountNav } from "@/components/account-nav"
import { useAuth } from "@/contexts/auth-context"
import { ToastProvider } from "@radix-ui/react-toast"

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
    }
  }, [user, router])

  if (!user) {
    return null // or a loading spinner
  }

  return (
    <ToastProvider>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] px-4 py-8">
        <aside className="hidden md:block">
          <AccountNav />
        </aside>
        <main>{children}</main>
      </div>
    </ToastProvider>
  )
}

