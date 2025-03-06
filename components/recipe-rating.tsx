"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { RecipeRatingInput } from "./recipe-rating-input"

interface RecipeRatingProps {
  recipeId: string
  initialRating: number | null
  initialRatingCount: number
}

export function RecipeRating({ recipeId, initialRating, initialRatingCount }: RecipeRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [ratingCount, setRatingCount] = useState(initialRatingCount)

  const handleRatingSubmit = (newRating: number, newRatingCount: number) => {
    setRating(newRating)
    setRatingCount(newRatingCount)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${star <= (rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating ? rating.toFixed(1) : "No ratings"} ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
        </span>
      </div>
      <RecipeRatingInput
        recipeId={recipeId}
        initialRating={rating}
        initialRatingCount={ratingCount}
        onRatingSubmit={handleRatingSubmit}
      />
    </div>
  )
}

