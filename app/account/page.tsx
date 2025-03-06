import type { Metadata } from "next"
import { AccountForm } from "@/components/account-form"

export const metadata: Metadata = {
  title: "My Account",
  description: "View and edit your account information",
}

export default function AccountPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <AccountForm />
    </div>
  )
}

