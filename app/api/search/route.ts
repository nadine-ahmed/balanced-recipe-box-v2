import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// import { createClient } from "@/utils/supabase/server" // Removed this line
// import { cookies } from "next/headers" // Removed this line

const supabase = getSupabase()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 })
  }

  // const cookieStore = cookies() // Removed this line
  // const supabase = createClient(cookieStore) // Removed this line

  try {
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        id,
        title,
        image_url,
        cooking_time,
        difficulty,
        average_rating,
        total_ratings,
        recipe_categories!inner (
          categories!inner (
            id,
            name,
            slug
          )
        )
      `)
      .or(`title.ilike.%${query}%, instructions.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    const processedData =
      data?.map((recipe) => {
        const categories = recipe.recipe_categories?.map((rc: any) => rc.categories).filter(Boolean) || []
        const { recipe_categories: _, ...rest } = recipe
        return {
          ...rest,
          categories,
        }
      }) || []

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Error searching recipes:", error)
    return NextResponse.json({ error: "An error occurred while searching recipes" }, { status: 500 })
  }
}

