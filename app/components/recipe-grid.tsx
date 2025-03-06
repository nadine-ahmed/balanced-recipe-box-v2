"use client"

import { useEffect, useState } from "react"
import { getRecipes } from "@/lib/recipes"
import { RecipeCard } from "@/components/recipe-card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import type { Recipe } from "@/types/supabase"

export function RecipeGrid() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentPage = Number(searchParams.get("page") || "1")
  const categorySlug = searchParams.get("category") || undefined

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function loadRecipes() {
      setLoading(true)
      try {
        console.log("Fetching recipes with category:", categorySlug)
        const { data: fetchedRecipes, totalPages } = await getRecipes({
          categorySlug,
          page: currentPage,
          limit: 10,
        })
        console.log("Fetched recipes:", fetchedRecipes)
        setRecipes(fetchedRecipes)
        setTotalPages(totalPages)
      } catch (err) {
        console.error("Error loading recipes:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [categorySlug, currentPage])

  // Helper function to create pagination URLs
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    return `${pathname}?${params.toString()}`
  }

  // Generate pagination items
  const paginationItems = []

  // Always show first page
  if (totalPages > 0) {
    paginationItems.push(
      <PaginationItem key="page-1">
        <PaginationLink href={createPageUrl(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>,
    )
  }

  // Add ellipsis if needed
  if (currentPage > 3) {
    paginationItems.push(
      <PaginationItem key="ellipsis-1">
        <PaginationEllipsis />
      </PaginationItem>,
    )
  }

  // Add pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    paginationItems.push(
      <PaginationItem key={`page-${i}`}>
        <PaginationLink href={createPageUrl(i)} isActive={currentPage === i}>
          {i}
        </PaginationLink>
      </PaginationItem>,
    )
  }

  // Add ellipsis if needed
  if (currentPage < totalPages - 2) {
    paginationItems.push(
      <PaginationItem key="ellipsis-2">
        <PaginationEllipsis />
      </PaginationItem>,
    )
  }

  // Always show last page if there is more than one page
  if (totalPages > 1) {
    paginationItems.push(
      <PaginationItem key={`page-${totalPages}`}>
        <PaginationLink href={createPageUrl(totalPages)} isActive={currentPage === totalPages}>
          {totalPages}
        </PaginationLink>
      </PaginationItem>,
    )
  }

  if (loading) {
    return (
      <div className="py-12">
        <Spinner size="lg" aria-label="Loading recipes" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No recipes found.</p>
        {categorySlug && (
          <p className="text-sm text-muted-foreground mt-2">Try selecting a different category or view all recipes.</p>
        )}
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recipes</h2>
        {categorySlug && (
          <Link href={`/recipes`} className="text-sm font-medium text-muted-foreground hover:underline">
            View all
          </Link>
        )}
      </div>
      {!user && (
        <div className="absolute inset-0 backdrop-blur-md z-10 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to view recipes</h2>
            <p className="mb-6">Create an account or sign in to access our collection of recipes.</p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${!user ? "filter blur-sm" : ""}`}>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            image_url={recipe.image_url}
            cooking_time={recipe.cooking_time}
            difficulty={recipe.difficulty}
            average_rating={recipe.average_rating}
            total_ratings={recipe.total_ratings}
            main_category={recipe.categories?.[0]?.name}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href={createPageUrl(currentPage - 1)} />
              </PaginationItem>
            )}

            {paginationItems}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext href={createPageUrl(currentPage + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

