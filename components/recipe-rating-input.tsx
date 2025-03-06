"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

const supabase = getSupabase()

interface RatingInputProps {
  recipeId: string
  initialRating: number | null
  initialRatingCount: number
  onRatingSubmit: (newRating: number, newRatingCount: number) => void
}

export function RecipeRatingInput({ recipeId, initialRating, initialRatingCount, onRatingSubmit }: RatingInputProps) {
  const [rating, setRating] = useState<number>(0)
  const [hasRated, setHasRated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [averageRating, setAverageRating] = useState(initialRating || 0)
  const [ratingCount, setRatingCount] = useState(initialRatingCount || 0)
  const { user } = useAuth()

  useEffect(() => {
    const checkFunction = async () => {
      try {
        if (user && recipeId) {
          await checkUserRating()
        }
      } catch (error) {
        console.error("Error in useEffect:", error)
        // Handle the error appropriately, e.g., show a toast message
      }
    }
    checkFunction()
  }, [user, recipeId])

  const checkUserRating = async () => {
    if (!user || !recipeId) return

    try {
      const { data, error } = await supabase
        .from("recipe_ratings")
        .select("rating")
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking user rating:", error)
        return
      }

      if (data) {
        setRating(data.rating)
        setHasRated(true)
      } else {
        setHasRated(false)
        setRating(0)
      }
    } catch (error) {
      console.error("Error checking existing rating:", error)
    }
  }

  const handleRatingSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate recipes",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data: functionData, error: functionError } = await supabase.rpc("submit_rating", {
        p_recipe_id: recipeId,
        p_user_id: user.id,
        p_rating: rating,
      })

      if (functionError) {
        throw functionError
      }

      if (functionData && functionData.length > 0) {
        const { new_average_rating, new_total_ratings } = functionData[0]
        setHasRated(true)
        setAverageRating(new_average_rating)
        setRatingCount(new_total_ratings)
        onRatingSubmit(new_average_rating, new_total_ratings)

        toast({
          title: "Rating submitted",
          description: "Thank you for rating this recipe!",
        })
      } else {
        throw new Error("Unexpected response from submit_rating function")
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!recipeId) {
    console.error("RecipeId is missing")
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => !hasRated && setRating(value)}
            className={`p-1 ${hasRated ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={hasRated}
          >
            <Star
              className={`w-6 h-6 ${
                value <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
      <Button onClick={handleRatingSubmit} disabled={isSubmitting || hasRated || rating === 0 || !user}>
        {hasRated ? "Already Rated" : "Submit Rating"}
      </Button>
    </div>
  )
}

