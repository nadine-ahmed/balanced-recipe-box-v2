"use client"

import { useEffect } from "react"

import type React from "react"

import { createContext, useContext, useState, useMemo, useCallback } from "react"
import { getRecipes } from "@/lib/recipes"
import type { Recipe } from "@/types/supabase"
import { debounce } from "@/utils/debounce"

interface RecipeContextType {
  isLoading: boolean
  recipes: Recipe[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  loadRecipes: (options?: { categorySlug?: string; page?: number }) => Promise<void>
}

const RecipeContext = createContext<RecipeContextType | null>(null)

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined)

  const debouncedSearch = useMemo(() => debounce(loadRecipes, 250), [loadRecipes])

  const loadRecipes = useCallback(
    async (options?: { categorySlug?: string; page?: number }) => {
      setIsLoading(true)
      try {
        const { data, totalPages } = await getRecipes({
          categorySlug: options?.categorySlug || categorySlug,
          page: options?.page || currentPage,
          limit: 10,
        })
        setRecipes(data)
      } catch (error) {
        console.error("Error loading recipes:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [categorySlug, currentPage],
  )

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  useEffect(() => {
    debouncedSearch({ categorySlug })
  }, [searchTerm, debouncedSearch, categorySlug])

  const value = useMemo(
    () => ({
      isLoading,
      recipes,
      searchTerm,
      setSearchTerm,
      loadRecipes,
    }),
    [isLoading, recipes, searchTerm, loadRecipes],
  )

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
}

export const useRecipeContext = () => {
  const context = useContext(RecipeContext)
  if (context === null) {
    throw new Error("useRecipeContext must be used within a RecipeProvider")
  }
  return context
}
\
"

