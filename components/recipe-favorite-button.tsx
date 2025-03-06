"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FavoriteButtonProps {
  recipeId: string
  variant?: "default" | "card"
}

export function RecipeFavoriteButton({ recipeId, variant = "default" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      checkIfFavorite()
    }
  }, [user])

  const checkIfFavorite = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("recipe_favorites")
        .select("id")
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error checking favorite status:", error)
        return
      }

      setIsFavorite(data.length > 0)
    } catch (error) {
      console.error("Error checking favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save recipes to favorites",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("recipe_favorites")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id)

        if (error) throw error

        setIsFavorite(false)
        toast({
          title: "Recipe removed",
          description: "Recipe removed from favorites",
        })
      } else {
        const { error } = await supabase.from("recipe_favorites").insert({
          recipe_id: recipeId,
          user_id: user.id,
        })

        if (error) throw error

        setIsFavorite(true)
        toast({
          title: "Recipe saved",
          description: "Recipe added to favorites",
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === "card") {
    return (
      <Button
        variant="secondary"
        size="icon"
        onClick={toggleFavorite}
        disabled={isLoading || !user}
        className={`rounded-full ${
          isFavorite ? "bg-red-500 hover:bg-red-600" : "bg-white hover:bg-gray-100"
        } shadow-md`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-white text-white" : "text-gray-600"}`} />
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            disabled={isLoading || !user}
            className={`relative rounded-full p-2 transition-colors ${
              isFavorite ? "bg-red-500 text-white hover:bg-red-600" : "bg-background hover:bg-muted"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{!user ? "Please sign in to save recipes" : isFavorite ? "Remove from Likes" : "Add to Likes"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

