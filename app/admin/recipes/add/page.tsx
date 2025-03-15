"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from 'react-hot-toast'
import { getSupabase } from "@/lib/supabase"
import { Trash2 } from "lucide-react"

const supabase = getSupabase()

const verifySupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("recipes").select("id").limit(1)
    if (error) throw error
    return true
  } catch (error) {
    console.error("Supabase connection error:", error)
    return false
  }
}

const checkTableStructure = async () => {
  try {
    const { data, error } = await supabase.from("recipes").select().limit(1)

    if (error) throw error

    if (data && data.length > 0) {
      const sampleRecipe = data[0]
      return Object.keys(sampleRecipe)
    } else {
      return []
    }
  } catch (error) {
    console.error("Error checking table structure:", error)
    return []
  }
}

const checkUserPermissions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        title: "Test Recipe",
        instructions: ["Test"],
        cooking_time: 1,
        servings: 1,
        difficulty: "Easy",
        user_id: userId,
      })
      .select()
    if (error) throw error
    // Delete the test recipe
    if (data && data.length > 0) {
      await supabase.from("recipes").delete().eq("id", data[0].id)
    }
  } catch (error) {
    console.error("Error checking user permissions:", error)
  }
}

interface Recipe {
  title: string
  ingredients: string[]
  instructions: string[]
  cooking_time: number
  servings: number
  difficulty: string
  image_url: string | null
  images: string[]
  user_id: string
  average_rating?: number | null
  total_ratings?: number
}

export default function AddRecipePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: "",
    ingredients: "",
    instructions: "",
    cooking_time: "",
    servings: "",
    difficulty: "",
    image_url: "",
    images: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRecipe((prev) => ({ ...prev, [name]: value.replace(/\r\n/g, "\n") }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setRecipe((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newImageUrl.trim()) return

    setRecipe((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl],
    }))
    setNewImageUrl("")
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setRecipe((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to create a recipe")
      return
    }
    setLoading(true)
    try {
      // Validate required fields
      if (!recipe.title || !recipe.instructions || !recipe.cooking_time || !recipe.servings || !recipe.difficulty) {
        throw new Error("Please fill in all required fields")
      }

      const recipeData: Recipe = {
        title: recipe.title,
        instructions: recipe.instructions
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        cooking_time: Number.parseInt(recipe.cooking_time),
        servings: Number.parseInt(recipe.servings),
        difficulty: recipe.difficulty,
        user_id: user.id,
        image_url: recipe.image_url || null,
        images: recipe.images,
        average_rating: null,
        total_ratings: 0,
      }

      const { data, error } = await supabase.from("recipes").insert(recipeData).select()

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error("Recipe was not created successfully")
      }

      toast.success("Recipe created successfully")
      router.push("/admin/recipes")
    } catch (error) {
      console.error("Error creating recipe:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeChecks = async () => {
      const isConnected = await verifySupabaseConnection()
      if (isConnected) {
        const tableStructure = await checkTableStructure()
        if (user) {
          await checkUserPermissions(user.id)
        }
      }
    }

    initializeChecks()
  }, [user])

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Recipe</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={recipe.title} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (one per line)</Label>
            <Textarea
              id="instructions"
              name="instructions"
              value={recipe.instructions}
              onChange={handleChange}
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
                value={recipe.cooking_time}
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
                value={recipe.servings}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              name="difficulty"
              value={recipe.difficulty}
              onValueChange={(value) => handleSelectChange("difficulty", value)}
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

          <div className="space-y-2">
            <Label htmlFor="image_url">Main Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={recipe.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-4">
            <Label>Additional Images</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
              <Button type="button" onClick={handleAddImageUrl} variant="secondary">
                Add Image
              </Button>
            </div>

            {recipe.images.length > 0 && (
              <div className="grid gap-4">
                {recipe.images.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Recipe image ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 truncate">{url}</div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveImage(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Recipe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

