"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Ingredient } from "@/types/recipe"

interface IngredientsProps {
  ingredients: Ingredient[]
  title: React.ReactNode
}

export function RecipeIngredients({ ingredients, title }: IngredientsProps) {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({})

  const handleCheckboxChange = useCallback((id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  if (!ingredients || ingredients.length === 0) {
    return <div>No ingredients available.</div>
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}

      {ingredients.map((group) => (
        <div key={group.id} className="space-y-4">
          <h3 className="text-xl font-semibold">{group.group_name}</h3>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            {Array.isArray(group.group_ingredients) &&
              group.group_ingredients.map((ingredient, index) => {
                const id = `${group.id}-${index}`
                return (
                  <div key={id} className="flex items-center gap-4">
                    <Checkbox
                      id={id}
                      checked={checkedItems[id] || false}
                      onCheckedChange={() => handleCheckboxChange(id)}
                    />
                    <label htmlFor={id} className="text-lg cursor-pointer">
                      <span className="text-gray-600">{ingredient}</span>
                    </label>
                  </div>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}

