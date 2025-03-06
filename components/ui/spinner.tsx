import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  "aria-label"?: string
}

export function Spinner({ size = "md", className, "aria-label": ariaLabel = "Loading", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div role="status" aria-live="polite" className={cn("flex justify-center items-center", className)} {...props}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

