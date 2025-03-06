export type Recipe = {
  id: string
  title: string
  instructions: string[]
  cooking_time: number
  servings: number
  difficulty: string
  image_url: string | null
  user_id: string
  created_at: string
  updated_at: string
  images: string[]
  average_rating: number | null
  total_ratings: number
  categories: Array<{
    id: string
    name: string
  }>
  ingredients: Ingredient[]
  nutrition?: RecipeNutrition
}

export type RecipeRating = {
  id: string
  recipe_id: string
  user_id: string
  rating: number
  created_at: string
}

export type RecipeFavorite = {
  id: string
  recipe_id: string
  user_id: string
  created_at: string
}

export type Ingredient = {
  id: string
  group_name: string
  group_ingredients: { item: string; quantity?: number; unit?: string }[]
}

export type RecipeNutrition = {
  id: string
  recipe_id: string
  serving_size: string
  total_calories: number
  total_protein: number
  total_carbohydrates: number
  total_fats: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
}

export type Cuisine = {
  id: string
  name: string
  slug: string
}

