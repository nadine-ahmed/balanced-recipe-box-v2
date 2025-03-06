import { getSupabase } from "./supabase"

export type RatingDistribution = {
  rating: number
  count: number
  percentage: number
}

export async function getRatingDistribution(recipeId: string): Promise<RatingDistribution[]> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("recipe_ratings").select("rating").eq("recipe_id", recipeId)

    if (error) {
      console.error("Supabase error fetching rating distribution:", error)
      return getEmptyDistribution()
    }

    if (!data || data.length === 0) {
      console.log("No ratings found for this recipe")
      return getEmptyDistribution()
    }

    // Process the raw data to create the distribution
    const ratingCounts = data.reduce(
      (acc, { rating }) => {
        acc[rating] = (acc[rating] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const totalRatings = data.length

    const distribution: RatingDistribution[] = Array.from({ length: 5 }, (_, i) => {
      const rating = 5 - i
      const count = ratingCounts[rating] || 0
      return {
        rating,
        count,
        percentage: totalRatings > 0 ? (count / totalRatings) * 100 : 0,
      }
    })

    return distribution
  } catch (error) {
    console.error("Unexpected error in getRatingDistribution:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return getEmptyDistribution()
  }
}

export function getEmptyDistribution(): RatingDistribution[] {
  return Array.from({ length: 5 }, (_, i) => ({
    rating: 5 - i,
    count: 0,
    percentage: 0,
  }))
}

