"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Recipe, Category } from "@/types/recipe"
import { CategorySelector } from "@/components/CategorySelector"
import { ImageUploader } from "@/components/ImageUploader"
import { toast } from "@/components/ui/use-toast"

interface RecipeFormProps {
  recipe?: Recipe
  categories: Category[]
  onSubmit: (recipe: Recipe) => Promise<void>
}

export function RecipeForm({ recipe, categories, onSubmit }: RecipeFormProps) {
  const [formData, setFormData] = useState<Recipe>(
    recipe || {
      id: "",
      title: "",
      instructions: [],
      cooking_time: 0,
      servings: 0,
      difficulty: "",
      image_url: null,
      images: [],
      user_id: "",
      created_at: "",
      updated_at: "",
      average_rating: null,
      total_ratings: 0,
      recipe_categories: [],
    },
  )
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      toast({
        title: "Success",
        description: `Recipe ${recipe ? "updated" : "created"} successfully.`,
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: `Failed to ${recipe ? "update" : "create"} recipe. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions (one per line)</Label>
        <Textarea
          id="instructions"
          name="instructions"
          value={formData.instructions?.join("\n") || ""}
          onChange={(e) =>
            setFormData({ ...formData, instructions: e.target.value.split("\n").filter((i) => i.trim()) })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cooking_time">Cooking Time (minutes)</Label>
          <Input
            id="cooking_time"
            name="cooking_time"
            type="number"
            value={formData.cooking_time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            name="servings"
            type="number"
            value={formData.servings}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          name="difficulty"
          value={formData.difficulty}
          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ImageUploader
        mainImageUrl={formData.image_url}
        additionalImages={formData.images}
        onMainImageChange={(url) => setFormData({ ...formData, image_url: url })}
        onAdditionalImagesChange={(urls) => setFormData({ ...formData, images: urls })}
      />

      <CategorySelector
        categories={categories}
        selectedCategories={formData.recipe_categories}
        onChange={(newCategories) => setFormData({ ...formData, recipe_categories: newCategories })}
      />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : recipe ? "Update Recipe" : "Create Recipe"}
        </Button>
      </div>
    </form>
  )
}

