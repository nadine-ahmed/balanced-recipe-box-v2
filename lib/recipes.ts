import { getSupabase } from "@/lib/supabase"
import type { Recipe } from "@/types/supabase"

// Simple in-memory cache
const cache: { [key: string]: { data: Recipe[]; totalCount: number; timestamp: number } } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getRecipes(
  options: {
    categorySlug?: string
    page?: number
    limit?: number
  } = {},
): Promise<{ data: Recipe[]; totalCount: number; totalPages: number }> {
  const { categorySlug, page = 1, limit = 10 } = options
  const cacheKey = `${categorySlug || "all"}_page${page}_limit${limit}`

  // Check cache first
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
    const { data, totalCount } = cache[cacheKey]
    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    }
  }

  try {
    const supabase = getSupabase()
    const from = (page - 1) * limit
    const to = from + limit - 1

    // If we have a category slug, we need to use a different approach
    if (categorySlug) {
      console.log("Filtering by category slug:", categorySlug)

      // First, get the recipe IDs that match the category
      const { data: categoryRecipes, error: categoryError } = await supabase
        .from("recipe_categories")
        .select(`
          recipe_id,
          categories!inner (
            id,
            name,
            slug
          )
        `)
        .eq("categories.slug", categorySlug)

      if (categoryError) {
        console.error("Error fetching recipes by category:", categoryError)
        throw categoryError
      }

      // Extract the recipe IDs
      const recipeIds = categoryRecipes?.map((item) => item.recipe_id) || []
      console.log(`Found ${recipeIds.length} recipes with category slug ${categorySlug}`)

      if (recipeIds.length === 0) {
        return { data: [], totalCount: 0, totalPages: 0 }
      }

      // Now fetch the recipes with those IDs
      const { data, error, count } = await supabase
        .from("recipes")
        .select(
          `
          id,
          title,
          image_url,
          cooking_time,
          difficulty,
          average_rating,
          total_ratings,
          recipe_categories:recipe_categories (
            categories (
              id,
              name,
              slug
            )
          )
        `,
          { count: "exact" },
        )
        .in("id", recipeIds)
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        console.error("Error fetching filtered recipes:", error)
        throw error
      }

      // Process the data
      const processedData =
        data?.map((recipe) => {
          const categories = recipe.recipe_categories
            ? recipe.recipe_categories.map((rc: any) => rc.categories).filter(Boolean)
            : []
          const { recipe_categories: _, ...rest } = recipe
          return {
            ...rest,
            categories,
          } as Recipe
        }) || []

      const totalCount = count || 0

      // Update cache
      cache[cacheKey] = {
        data: processedData,
        totalCount,
        timestamp: Date.now(),
      }

      return {
        data: processedData,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    } else {
      // No category filter, fetch all recipes
      const { data, error, count } = await supabase
        .from("recipes")
        .select(
          `
          id,
          title,
          image_url,
          cooking_time,
          difficulty,
          average_rating,
          total_ratings,
          recipe_categories:recipe_categories (
            categories (
              id,
              name,
              slug
            )
          )
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        console.error("Error fetching recipes:", error)
        throw error
      }

      // Process the data to transform the nested categories structure
      const processedData =
        data?.map((recipe) => {
          const categories = recipe.recipe_categories
            ? recipe.recipe_categories.map((rc: any) => rc.categories).filter(Boolean)
            : []
          const { recipe_categories: _, ...rest } = recipe
          return {
            ...rest,
            categories,
          } as Recipe
        }) || []

      const totalCount = count || 0

      // Update cache
      cache[cacheKey] = {
        data: processedData,
        totalCount,
        timestamp: Date.now(),
      }

      return {
        data: processedData,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    }
  } catch (error) {
    console.error("Unexpected error in getRecipes:", error)
    return { data: [], totalCount: 0, totalPages: 0 }
  }
}

export async function checkRecipeNutritionTable(): Promise<{ exists: boolean; hasRows: boolean; rowCount?: number }> {
  try {
    const supabase = getSupabase()
    // Check if the table exists and count rows
    const { count, error } = await supabase.from("recipe_nutrition").select("*", { count: "exact", head: true })

    if (error) {
      if (error.code === "PGRST116") {
        // Table doesn't exist
        console.error("recipe_nutrition table does not exist:", error)
        return { exists: false, hasRows: false }
      }
      console.error("Error checking recipe_nutrition table:", error)
      throw error
    }

    return { exists: true, hasRows: count > 0, rowCount: count }
  } catch (error) {
    console.error("Unexpected error checking recipe_nutrition table:", error)
    return { exists: false, hasRows: false }
  }
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const supabase = getSupabase()

    // First fetch the recipe with categories
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_categories!inner (
          categories!inner (
            id,
            name,
            slug
          )
        )
      `)
      .eq("id", id)
      .maybeSingle()

    if (recipeError) {
      console.error("Error fetching recipe:", recipeError)
      return null
    }

    if (!recipeData) {
      return null
    }

    // Fetch ingredients
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from("ingredients")
      .select("id, group_name, group_ingredients")
      .eq("recipe_id", id)

    if (ingredientsError) {
      console.error("Error fetching ingredients:", ingredientsError)
      // Don't throw the error, just log it
    }

    // Fetch nutrition data separately
    const { data: nutritionData, error: nutritionError } = await supabase
      .from("recipe_nutrition")
      .select("*")
      .eq("recipe_id", id)
      .maybeSingle()

    if (nutritionError && nutritionError.code !== "PGRST116") {
      console.error("Error fetching nutrition data:", nutritionError)
    }

    // Process the categories, ingredients, and nutrition data
    const processedData: Recipe = {
      ...recipeData,
      categories: recipeData.recipe_categories?.map((rc: any) => rc.categories).filter(Boolean) || [],
      ingredients: ingredientsData || [],
      nutrition: nutritionData || null,
    }

    return processedData
  } catch (error) {
    console.error("Unexpected error in getRecipe:", error)
    return null
  }
}

