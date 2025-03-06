import { NextResponse } from "next/server"
import { checkRecipeNutritionTable } from "@/lib/recipes"

export async function GET() {
  try {
    const result = await checkRecipeNutritionTable()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error checking recipe_nutrition table:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

