"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from 'react-hot-toast'

export default function SignInPage() {
  const router = useRouter()
  const { signIn, resendConfirmationEmail, resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { error, data } = await signIn(email, password)
      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error("Invalid email or password. Please try again.")
        } else if (error.message === "Email not confirmed") {
          setShowResendConfirmation(true)
          toast.error("Please confirm your email address before signing in.")
        } else {
          toast.error(error.message)
        }
      } else {
        toast.success("Signed in successfully.")
        router.push("/")
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendConfirmation = async () => {
    try {
      const { error } = await resendConfirmationEmail(email)
      if (error) {
        toast.error("Failed to resend confirmation email. Please try again.")
      } else {
        toast.success("Confirmation email sent. Please check your inbox.")
      }
    } catch (error) {
      console.error("Error resending confirmation email:", error)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address to reset your password.")
      return
    }

    try {
      const { error } = await resetPassword(email)
      if (error) {
        toast.error("Failed to send password reset email. Please try again.")
      } else {
        toast.success("Password reset email sent. Please check your inbox.")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <p className="text-sm text-gray-600 mb-4">
        Access to this site is by invitation only. If you have an invitation, please sign in below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="flex justify-between items-center mt-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </div>
        <Button variant="link" className="mt-2 p-0" onClick={handleResetPassword}>
          Forgot Password?
        </Button>
      </form>
      {showResendConfirmation && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Haven't received the confirmation email?</p>
          <Button onClick={handleResendConfirmation} variant="outline" className="w-full">
            Resend Confirmation Email
          </Button>
        </div>
      )}
    </div>
  )
}

