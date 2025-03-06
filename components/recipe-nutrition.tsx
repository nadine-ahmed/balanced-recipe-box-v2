import type { RecipeNutrition } from "@/types/recipe"

interface NutritionProps {
  nutrition: RecipeNutrition | null
}

export function RecipeNutritionSection({ nutrition }: NutritionProps) {
  if (!nutrition) {
    return null
  }

  const nutritionItems = [
    { label: "Calories", value: nutrition.total_calories },
    { label: "Protein", value: nutrition.total_protein },
    { label: "Carbohydrates", value: nutrition.total_carbohydrates },
    { label: "Fats", value: nutrition.total_fats },
  ]

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Nutrition Information</h2>
      <p className="mb-4">Serving Size: {nutrition.serving_size}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {nutritionItems.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md transition-colors duration-300 hover:bg-gray-100"
          >
            <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
            <p className="text-xl">{item.value !== undefined ? item.value : "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

