import React from "react"
import type { Metadata } from "next"
import { Fira_Sans } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { AuthProvider } from "@/contexts/auth-context"
import { SupabaseProvider } from "@/contexts/supabase-context"
import { Toaster } from "react-hot-toast"

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Recipe App",
  description: "Discover and share delicious recipes",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={firaSans.className}>
        <SupabaseProvider>
          <AuthProvider>
            <React.StrictMode>
              <div className="min-h-screen bg-background flex flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </React.StrictMode>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
