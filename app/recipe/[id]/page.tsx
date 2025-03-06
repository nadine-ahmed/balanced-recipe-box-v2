"use server"

import { getRecipe } from "@/lib/recipes"
import { RecipeContent } from "@/components/recipe-content"
import { notFound } from "next/navigation"

export default async function RecipePage({ params }: { params: { id: string } }) {
  // Fetch the recipe data on the server
  const recipe = await getRecipe(params.id)

  // If recipe not found, show 404
  if (!recipe) {
    notFound()
  }

  return <RecipeContent id={params.id} initialRecipe={recipe} />
}

