import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"

async function getRecipe(id: string) {
  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      category:categories(name),
      cuisine:cuisines(name)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching recipe:", error)
    return null
  }

  return data
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id)

  if (!recipe) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{recipe.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p>{recipe.description}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Details</h2>
          <p>Cooking Time: {recipe.cooking_time} minutes</p>
          <p>Servings: {recipe.servings}</p>
          <p>Difficulty: {recipe.difficulty}</p>
          <p>Category: {recipe.category?.name || "N/A"}</p>
          <p>Cuisine: {recipe.cuisine?.name || "N/A"}</p>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc list-inside">
          {recipe.ingredients &&
            recipe.ingredients.map((ingredient: string, index: number) => <li key={index}>{ingredient}</li>)}
        </ul>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal list-inside">
          {recipe.instructions &&
            recipe.instructions.map((instruction: string, index: number) => <li key={index}>{instruction}</li>)}
        </ol>
      </div>
      {recipe.image_url && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Image</h2>
          <img src={recipe.image_url || "/placeholder.svg"} alt={recipe.title} className="max-w-full h-auto" />
        </div>
      )}
    </div>
  )
}

