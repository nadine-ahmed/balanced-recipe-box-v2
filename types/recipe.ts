export interface Recipe {
  id: string
  title: string
  instructions: string[]
  cooking_time: number
  servings: number
  difficulty: string
  image_url: string | null
  images: string[]
  user_id: string
  created_at: string
  updated_at: string
  average_rating: number | null
  total_ratings: number
  recipe_categories: RecipeCategory[]
  categories?: Category[]
  recipe_nutrition?: RecipeNutrition
}

export interface Ingredient {
  id: string
  recipe_id: string
  group_name: string
  group_ingredients: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface RecipeCategory {
  categories: Category
}

export interface RecipeNutrition {
  id: number
  recipe_id: string
  serving_size: string
  total_calories: string
  total_protein: string
  total_carbohydrates: string
  total_fats: string
}

