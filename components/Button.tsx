"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-input bg-background text-foreground hover:bg-muted",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        size === "sm" && "text-sm px-2 py-1",
        size === "md" && "text-base px-4 py-2",
        size === "lg" && "text-lg px-6 py-3",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)
Button.displayName = "Button"

export default Button

