"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { error, data } = await signUp(email, password, username)
      if (error) {
        if (error.message.includes("duplicate key value")) {
          toast({
            title: "Error",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Account created successfully. Please check your email for verification.",
        })
        router.push("/auth/signin")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </Button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-blue-500 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}

