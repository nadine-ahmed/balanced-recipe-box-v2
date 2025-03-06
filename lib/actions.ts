"use server"

import { createServerClient } from "@/lib/server-supabase"
import { revalidatePath } from "next/cache"

export async function deleteRecipe(recipeId: string) {
  try {
    const supabase = createServerClient()

    // Delete recipe_nutrition records first (foreign key constraint)
    await supabase.from("recipe_nutrition").delete().eq("recipe_id", recipeId)

    // Delete recipe_categories records (foreign key constraint)
    await supabase.from("recipe_categories").delete().eq("recipe_id", recipeId)

    // Delete ingredients records (foreign key constraint)
    await supabase.from("ingredients").delete().eq("recipe_id", recipeId)

    // Delete ratings (foreign key constraint)
    await supabase.from("ratings").delete().eq("recipe_id", recipeId)

    // Delete favorites (foreign key constraint)
    await supabase.from("favorites").delete().eq("recipe_id", recipeId)

    // Finally delete the recipe
    const { error } = await supabase.from("recipes").delete().eq("id", recipeId)

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`)
    }

    // Revalidate the recipes page to reflect the changes
    revalidatePath("/admin/recipes")

    return { success: true }
  } catch (error) {
    console.error("Error deleting recipe:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

