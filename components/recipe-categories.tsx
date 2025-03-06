"use client"

interface Category {
  id: string
  name: string
  slug?: string
}

interface RecipeCategoriesProps {
  categories: Category[]
}

export function RecipeCategories({ categories }: RecipeCategoriesProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="px-4 py-2 bg-gray-50 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium uppercase">{category.name}</span>
        </div>
      ))}
    </div>
  )
}

