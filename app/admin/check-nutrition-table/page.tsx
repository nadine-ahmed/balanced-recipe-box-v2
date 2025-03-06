import { checkRecipeNutritionTable } from "@/lib/recipes"

export default async function CheckNutritionTablePage() {
  const result = await checkRecipeNutritionTable()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Recipe Nutrition Table Check</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-2">
          <strong>Table Exists:</strong> {result.exists ? "Yes" : "No"}
        </p>
        <p className="mb-2">
          <strong>Has Rows:</strong> {result.hasRows ? "Yes" : "No"}
        </p>
        {result.rowCount !== undefined && (
          <p className="mb-2">
            <strong>Row Count:</strong> {result.rowCount}
          </p>
        )}
      </div>
      {!result.exists && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Warning</p>
          <p>The recipe_nutrition table does not exist. You may need to create it or check your database setup.</p>
        </div>
      )}
      {result.exists && !result.hasRows && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Warning</p>
          <p>The recipe_nutrition table exists but has no rows. You may need to populate it with data.</p>
        </div>
      )}
    </div>
  )
}

