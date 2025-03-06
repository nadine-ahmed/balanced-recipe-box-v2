"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { User, BookMarked } from "lucide-react"

const items = [
  {
    title: "Profile",
    href: "/account/profile",
    icon: User,
  },
  {
    title: "Favorite Recipes",
    href: "/account/favorite-recipes",
    icon: BookMarked,
  },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn("justify-start", pathname === item.href && "bg-muted")}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

