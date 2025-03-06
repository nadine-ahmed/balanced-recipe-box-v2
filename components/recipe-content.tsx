"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Clock, ChefHat, Users } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { RecipeIngredients } from "./recipe-ingredients"
import { RecipeDirections } from "./recipe-directions"
import { RecipeRating } from "./recipe-rating"
import { ImageGallery } from "./image-gallery"
import { RecipeNutritionSection } from "./recipe-nutrition"
import { RecipeCategories } from "./recipe-categories"
import type { Recipe } from "@/types/recipe"

const supabase = getSupabase()

interface RecipeContentProps {
  id: string
  initialRecipe?: Recipe
}

export function RecipeContent({ id, initialRecipe }: RecipeContentProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(initialRecipe || null)
  const [loading, setLoading] = useState(!initialRecipe)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialRecipe) {
      fetchRecipe()
    } else if (initialRecipe && !initialRecipe.nutrition) {
      fetchNutritionData()
    }
  }, [initialRecipe])

  const fetchNutritionData = async () => {
    if (!initialRecipe) return
    try {
      const { data: nutritionData, error: nutritionError } = await supabase
        .from("recipe_nutrition")
        .select("*")
        .eq("recipe_id", id)
        .maybeSingle()

      if (nutritionError && nutritionError.code !== "PGRST116") {
        // Removed console.error("Error fetching nutrition data:", nutritionError)
      }

      if (nutritionData) {
        setRecipe((prevRecipe) => {
          if (!prevRecipe) return null
          return {
            ...prevRecipe,
            nutrition: nutritionData,
          }
        })
      }
    } catch (err) {
      // Removed console.error("Error fetching nutrition data:", err)
    }
  }

  const fetchRecipe = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch recipe with all related data
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select(`
          *,
          ingredients (id, group_name, group_ingredients),
          recipe_categories (categories (id, name))
        `)
        .eq("id", id)
        .single()

      if (recipeError) {
        // Removed console.error("Error fetching recipe:", recipeError)
        setError("Failed to load recipe details")
        setLoading(false)
        return
      }

      // Fetch nutrition data
      const { data: nutritionData, error: nutritionError } = await supabase
        .from("recipe_nutrition")
        .select("*")
        .eq("recipe_id", id)
        .maybeSingle()

      if (nutritionError && nutritionError.code !== "PGRST116") {
        // Removed console.error("Error fetching nutrition data:", nutritionError)
      }

      // Combine the data
      const completeRecipe = {
        ...recipeData,
        nutrition: nutritionData || null,
      }

      setRecipe(completeRecipe)
    } catch (err) {
      // Removed console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading recipe...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>
  }

  if (!recipe) {
    return <div className="text-center py-12">Recipe not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>

      {recipe.image_url && (
        <div className="mb-8">
          <div className="relative aspect-video">
            <Image
              src={recipe.image_url || "/placeholder.svg"}
              alt={recipe.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center text-center">
          <Clock className="w-6 h-6 mb-2" />
          <div className="font-medium">{recipe.cooking_time} mins</div>
          <div className="text-gray-500 text-sm">Cooking Time</div>
        </div>

        <div className="flex flex-col items-center text-center">
          <Users className="w-6 h-6 mb-2" />
          <div className="font-medium">Serves {recipe.servings}</div>
          <div className="text-gray-500 text-sm">Servings</div>
        </div>

        <div className="flex flex-col items-center text-center">
          <ChefHat className="w-6 h-6 mb-2" />
          <div className="font-medium">{recipe.difficulty}</div>
          <div className="text-gray-500 text-sm">Difficulty</div>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <RecipeIngredients ingredients={recipe.ingredients || []} title="" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Directions</h2>
          <RecipeDirections instructions={recipe.instructions || []} />
        </div>
      </div>

      {recipe.nutrition && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Nutrition Information</h2>
          <RecipeNutritionSection nutrition={recipe.nutrition} />
        </div>
      )}

      {recipe.images && recipe.images.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Additional Images</h2>
          <ImageGallery images={recipe.images} alt={recipe.title} />
        </div>
      )}

      {recipe.recipe_categories && recipe.recipe_categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <RecipeCategories categories={recipe.recipe_categories.map((rc) => rc.categories)} />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overall Rating</h2>
        <RecipeRating
          recipeId={recipe.id}
          initialRating={recipe.average_rating}
          initialRatingCount={recipe.total_ratings}
        />
      </div>
    </div>
  )
}

