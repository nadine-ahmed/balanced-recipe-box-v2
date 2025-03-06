import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Ingredient } from "@/types/recipe"
import { Plus, Trash2 } from "lucide-react"

interface IngredientGroupsProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

export function IngredientGroups({ ingredients, onChange }: IngredientGroupsProps) {
  console.log("Ingredients in IngredientGroups:", ingredients)

  const addGroup = () => {
    onChange([...ingredients, { id: "", recipe_id: "", group_name: "", group_ingredients: "[]" }])
  }

  const removeGroup = (index: number) => {
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    onChange(newIngredients)
  }

  const updateGroup = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients]
    if (field === "group_ingredients") {
      // Ensure the value is a valid JSON array
      try {
        JSON.parse(value)
      } catch (e) {
        console.error("Invalid JSON for group_ingredients:", e)
        return
      }
    }
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    onChange(newIngredients)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ingredients</h3>
      {ingredients.map((group, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Group name"
              value={group.group_name}
              onChange={(e) => updateGroup(index, "group_name", e.target.value)}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            placeholder="Enter ingredients (one per line)"
            value={JSON.parse(group.group_ingredients || "[]").join("\n")}
            onChange={(e) =>
              updateGroup(
                index,
                "group_ingredients",
                JSON.stringify(e.target.value.split("\n").filter((i) => i.trim())),
              )
            }
            rows={3}
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addGroup} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Ingredient Group
      </Button>
    </div>
  )
}

