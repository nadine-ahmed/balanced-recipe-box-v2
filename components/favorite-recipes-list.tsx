"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import toast from 'react-hot-toast'

interface SavedRecipe {
  id: string
  recipeId: string
  title: string
  image: string | null
  savedAt: string
}

export function FavoriteRecipesList() {
  const { user } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavoriteRecipes()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchFavoriteRecipes = async () => {
    const supabase = getSupabase()
    try {
      const { data, error } = await supabase
        .from("recipe_favorites")
        .select(`
          id,
          recipe_id,
          recipes (id, title, image_url),
          created_at
        `)
        .eq("user_id", user?.id)

      if (error) {
        console.error("Error fetching favorite recipes:", error)
        toast.error("Failed to fetch your favorite recipes.")
        return
      }

      const processedRecipes = (data || []).map(
        (item: any): SavedRecipe => ({
          id: item.id,
          recipeId: item.recipe_id,
          title: item.recipes.title,
          image: item.recipes.image_url,
          savedAt: item.created_at,
        }),
      )

      setSavedRecipes(processedRecipes)
    } catch (error) {
      console.error("Unexpected error fetching favorite recipes:", error)
      toast.error("An unexpected error occurred while fetching your favorite recipes.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-0">
              <div className="aspect-video relative bg-gray-200 rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (savedRecipes.length === 0) {
    return <p>No favorite recipes yet.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {savedRecipes.map((recipe) => (
        <Link href={`/recipe/${recipe.recipeId}`} key={recipe.id} className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="p-0">
              <div className="aspect-video relative">
                <Image
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 line-clamp-1">{recipe.title}</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Saved on {new Date(recipe.savedAt).toLocaleDateString()}
                </span>
                <Button variant="ghost" size="icon" onClick={(e) => e.preventDefault()}>
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

