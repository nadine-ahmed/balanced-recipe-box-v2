"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { getRecipe } from "@/lib/recipes"
import type { Recipe } from "@/types/recipe"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface IngredientGroup {
  id: string
  group_name: string
  group_ingredients: string[]
}

export default function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipeData()
  }, [])

  const fetchRecipeData = async () => {
    try {
      setLoading(true)
      setError(null)

      const recipeData = await getRecipe(params.id)

      if (!recipeData) {
        throw new Error("Recipe not found")
      }

      setRecipe(recipeData)

      // Process ingredients
      if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
        const processedGroups = recipeData.ingredients.map((group) => ({
          id: group.id,
          group_name: group.group_name,
          group_ingredients: Array.isArray(group.group_ingredients)
            ? group.group_ingredients
            : typeof group.group_ingredients === "string"
              ? JSON.parse(group.group_ingredients)
              : [],
        }))

        setIngredientGroups(processedGroups)
      } else {
        setIngredientGroups([])
      }
    } catch (err) {
      console.error("Error fetching recipe data:", err)
      setError(err instanceof Error ? err.message : "Failed to load recipe data")
      toast({
        title: "Error",
        description: "Failed to load recipe data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev)
      if (next.has(ingredient)) {
        next.delete(ingredient)
      } else {
        next.add(ingredient)
      }
      return next
    })
  }

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Recipe</h2>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold">Recipe Not Found</h2>
          <p className="text-yellow-600 mt-1">The recipe you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-700 mb-8">{recipe.title}</h1>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
        {ingredientGroups.length === 0 ? (
          <p>No ingredients found for this recipe.</p>
        ) : (
          ingredientGroups.map((group) => (
            <div key={group.id} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">{group.group_name}</h3>
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
                {Array.isArray(group.group_ingredients) &&
                  group.group_ingredients.map((ingredient, index) => (
                    <div key={`${group.id}-${index}`} className="flex items-center gap-3">
                      <Checkbox
                        id={`${group.id}-${index}`}
                        checked={checkedIngredients.has(ingredient)}
                        onCheckedChange={() => toggleIngredient(ingredient)}
                        className="w-5 h-5 border-2"
                      />
                      <label
                        htmlFor={`${group.id}-${index}`}
                        className="text-lg leading-none cursor-pointer font-normal"
                      >
                        {ingredient}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        {recipe.instructions && recipe.instructions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-2">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="text-lg ml-4">
                {instruction}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground">No instructions available.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="font-semibold mb-2">Cooking Time</h3>
          <p>{recipe.cooking_time} minutes</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Servings</h3>
          <p>{recipe.servings}</p>
        </div>
      </div>

      <Button
        onClick={() => {
          console.log("Current ingredient groups:", ingredientGroups)
          console.log("Raw recipe data:", recipe)
        }}
        variant="outline"
        className="mt-4"
      >
        Log Debug Info
      </Button>

      {/* Debug section */}
      <div className="mt-8 border-t pt-8">
        <h3 className="text-xl font-bold mb-4">Debug Information</h3>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          <code>
            {JSON.stringify(
              {
                recipeId: params.id,
                ingredientGroups: ingredientGroups,
                recipe: recipe,
              },
              null,
              2,
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}

