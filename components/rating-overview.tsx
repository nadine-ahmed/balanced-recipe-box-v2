"use client"

import { Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { RatingDistribution } from "@/lib/ratings"

interface RatingOverviewProps {
  averageRating: number
  totalRatings: number
  distribution: RatingDistribution[]
}

export function RatingOverview({ averageRating, totalRatings, distribution }: RatingOverviewProps) {
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < count ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
      />
    ))
  }

  if (totalRatings === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Rating Overview</h2>
        <p>No ratings yet. Be the first to rate this recipe!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Rating Overview</h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="text-5xl font-bold">
            {averageRating.toFixed(1)}
            <span className="text-xl text-gray-500 font-normal"> / 5</span>
          </div>
          <div className="flex gap-0.5">{renderStars(Math.round(averageRating))}</div>
          <div className="text-sm text-gray-500">
            {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
          </div>
        </div>

        <div className="flex-1 space-y-2 min-w-[200px]">
          {distribution.map((item) => (
            <div key={item.rating} className="flex items-center gap-2">
              <div className="flex gap-0.5 w-24">{renderStars(item.rating)}</div>
              <Progress value={item.percentage} className="h-2 flex-1" indicatorClassName="bg-red-500" />
              <div className="w-12 text-sm text-gray-500 text-right">{item.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

