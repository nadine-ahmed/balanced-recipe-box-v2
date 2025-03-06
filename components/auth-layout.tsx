"use client"

import type React from "react"

import { motion } from "framer-motion"
import Image from "next/image"

interface AuthLayoutProps {
  children: React.ReactNode
  image: string
  imagePosition?: "left" | "right"
}

export function AuthLayout({ children, image, imagePosition = "left" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: imagePosition === "left" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative hidden lg:block ${imagePosition === "right" ? "order-last" : ""}`}
      >
        <Image src={image || "/placeholder.svg"} alt="Food background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: imagePosition === "left" ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md space-y-8">{children}</div>
      </motion.div>
    </div>
  )
}

