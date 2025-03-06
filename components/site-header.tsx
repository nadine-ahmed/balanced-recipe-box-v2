"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function SiteHeader() {
  const { user, profile, signOut, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  const handleSignOut = async () => {
    await signOut()
    // The redirection is now handled in the AuthContext
  }

  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-16 w-16">
            <Image
              src="https://i.imgur.com/Xgjao6C.png"
              alt="The Balanced Recipe Box Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-base font-bold">The Balanced Recipe Box by Nadine</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/account/profile">
                <Button variant="ghost" size="icon">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.username || "User avatar"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

