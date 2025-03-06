"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getSupabase } from "@/lib/supabase"
import type { Recipe, Ingredient, Category } from "@/types/recipe"
import { RecipeForm } from "@/components/RecipeForm"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ErrorMessage"

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  useEffect(() => {
    fetchRecipeData()
  }, [])

  const fetchRecipeData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [recipeData, categoriesData, ingredientsData] = await Promise.all([
        fetchRecipe(params.id),
        fetchCategories(),
        fetchIngredients(params.id),
      ])

      setRecipe(recipeData)
      setCategories(categoriesData)
      setIngredients(ingredientsData)
    } catch (err) {
      console.error("Error fetching recipe data:", err)
      setError("Failed to load recipe data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRecipe = async (updatedRecipe: Recipe) => {
    try {
      setLoading(true)
      setError(null)

      // Extract recipe_categories before updating the recipe
      const { recipe_categories, ...recipeToUpdate } = updatedRecipe

      await updateRecipe(recipeToUpdate)

      if (recipe_categories && recipe_categories.length > 0) {
        await updateRecipeCategories(updatedRecipe.id, recipe_categories)
      }

      toast({ title: "Success", description: "Recipe updated successfully" })
      router.push("/admin/recipes")
    } catch (err) {
      console.error("Error updating recipe:", err)
      setError("Failed to update recipe. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!recipe) return <ErrorMessage message="Recipe not found" />

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
      <RecipeForm recipe={recipe} categories={categories} onSubmit={handleUpdateRecipe} />
    </div>
  )
}

async function fetchRecipe(id: string): Promise<Recipe> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_categories (
        category_id,
        main_category,
        categories (
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("categories").select("*").order("name")
  if (error) throw error
  return data
}

async function fetchIngredients(recipeId: string): Promise<Ingredient[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("ingredients").select("*").eq("recipe_id", recipeId).order("group_name")

  if (error) throw error

  // Ensure each ingredient has valid JSON for group_ingredients
  return data.map((ingredient) => ({
    ...ingredient,
    group_ingredients: ingredient.group_ingredients || JSON.stringify([]),
  }))
}

async function updateRecipe(recipe: Omit<Recipe, "recipe_categories">): Promise<void> {
  const supabase = getSupabase()

  // Remove properties that are not columns in the recipes table
  const { categories, ingredients, nutrition, ...recipeData } = recipe as any

  const { error } = await supabase.from("recipes").update(recipeData).eq("id", recipe.id)
  if (error) throw error
}

async function updateRecipeCategories(recipeId: string, recipeCategories: any[]): Promise<void> {
  const supabase = getSupabase()

  try {
    // First, delete existing recipe categories
    const { error: deleteError } = await supabase.from("recipe_categories").delete().eq("recipe_id", recipeId)

    if (deleteError) throw deleteError

    // Prepare categories for insertion
    const categoriesToInsert = recipeCategories.map((category) => {
      // Handle different possible formats of category data
      let categoryId

      if (typeof category === "string") {
        categoryId = category
      } else if (category && typeof category === "object") {
        // If it's an object with category_id property
        if (category.category_id) {
          categoryId = category.category_id
        }
        // If it's an object with categories.id property (from the join)
        else if (category.categories && category.categories.id) {
          categoryId = category.categories.id
        }
        // If it's a direct id property
        else if (category.id) {
          categoryId = category.id
        }
      }

      return {
        recipe_id: recipeId,
        category_id: categoryId,
        main_category: category.main_category || false,
      }
    })

    if (categoriesToInsert.length > 0) {
      const { error: insertError } = await supabase.from("recipe_categories").insert(categoriesToInsert)

      if (insertError) throw insertError
    }
  } catch (error) {
    console.error("Error updating recipe categories:", error)
    throw error
  }
}

async function updateIngredients(recipeId: string, ingredients: Ingredient[]): Promise<void> {
  const supabase = getSupabase()
  try {
    // First, delete existing ingredients
    const { error: deleteError } = await supabase.from("ingredients").delete().eq("recipe_id", recipeId)

    if (deleteError) throw deleteError

    // Prepare ingredients for insertion
    const ingredientsToInsert = ingredients.map((ing) => ({
      recipe_id: recipeId,
      group_name: ing.group_name,
      group_ingredients: ing.group_ingredients, // Already JSON string
    }))

    // Insert new ingredients
    const { error: insertError } = await supabase.from("ingredients").insert(ingredientsToInsert)

    if (insertError) throw insertError
  } catch (error) {
    console.error("Error updating ingredients:", error)
    throw error
  }
}

