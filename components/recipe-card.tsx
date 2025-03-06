"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { RecipeFavoriteButton } from "@/components/recipe-favorite-button"

interface RecipeCardProps {
  id: string
  title: string
  image_url: string | null
  cooking_time: number
  difficulty: string
  average_rating?: number | null
  total_ratings?: number
  main_category?: string | null
}

export function RecipeCard({
  id,
  title,
  image_url,
  cooking_time,
  difficulty,
  average_rating = 0,
  total_ratings = 0,
  main_category,
}: RecipeCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 group">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden">
          {image_url ? (
            <Image
              src={image_url || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

          {/* Rating Pill */}
          {average_rating > 0 && (
            <div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{average_rating.toFixed(1)}</span>
            </div>
          )}

          {/* Favorite Button */}
          <div className="absolute top-3 right-3">
            <RecipeFavoriteButton recipeId={id} variant="card" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {main_category && <span className="text-red-500 font-medium text-sm mb-1 block">{main_category}</span>}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{cooking_time} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" />
            <span>{difficulty}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/recipe/${id}`} className="w-full">
          <Button variant="secondary" className="w-full">
            View Recipe
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

