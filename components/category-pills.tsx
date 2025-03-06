"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface Category {
  id: string
  name: string
  slug: string
}

export function CategoryPills() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const currentCategory = searchParams.get("category") || "all"
  const effectRan = useRef(false)

  useEffect(() => {
    if (effectRan.current === false) {
      fetchCategories()
      return () => {
        effectRan.current = true
      }
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("id, name, slug").order("name")

      if (error) {
        console.error("Error fetching categories:", error)
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error("Unexpected error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Reset to page 1 when changing categories
    params.set("page", "1")

    if (categorySlug === "all") {
      params.delete("category")
    } else {
      params.set("category", categorySlug)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-gray-100 animate-pulse" aria-hidden="true" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
      <Button
        key="all"
        variant={currentCategory === "all" ? "default" : "outline"}
        className={`rounded-full whitespace-nowrap ${currentCategory === "all" ? "bg-black text-white" : ""}`}
        onClick={() => handleCategoryClick("all")}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={currentCategory === category.slug ? "default" : "outline"}
          className={`rounded-full whitespace-nowrap ${currentCategory === category.slug ? "bg-black text-white" : ""}`}
          onClick={() => handleCategoryClick(category.slug)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}

