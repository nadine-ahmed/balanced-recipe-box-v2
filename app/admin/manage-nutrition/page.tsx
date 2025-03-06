"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { getSupabase } from "@/lib/supabase"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  recipeId: z.string().nonempty("Recipe is required"),
  servingSize: z.string().nonempty("Serving size is required"),
  totalCalories: z.string().nonempty("Total calories are required"),
  totalProtein: z.string().nonempty("Total protein is required"),
  totalCarbohydrates: z.string().nonempty("Total carbohydrates are required"),
  totalFats: z.string().nonempty("Total fats are required"),
})

type FormData = z.infer<typeof formSchema>

export default function ManageNutritionPage() {
  const [recipes, setRecipes] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [nutritionId, setNutritionId] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeId: "",
      servingSize: "",
      totalCalories: "",
      totalProtein: "",
      totalCarbohydrates: "",
      totalFats: "",
    },
  })

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    setInitialLoading(true)
    const supabase = getSupabase()
    const { data, error } = await supabase.from("recipes").select("id, title").order("title")

    if (error) {
      console.error("Error fetching recipes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch recipes. Please try again.",
        variant: "destructive",
      })
    } else {
      setRecipes(data || [])
    }
    setInitialLoading(false)
  }

  const fetchNutritionData = async (recipeId: string) => {
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("recipe_nutrition")
        .select("*")
        .eq("recipe_id", recipeId)
        .maybeSingle()

      if (error) {
        console.error("Error fetching nutrition data:", error)
        throw error
      }

      if (data) {
        // Existing nutrition data found, populate the form
        setValue("servingSize", data.serving_size || "")
        setValue("totalCalories", data.total_calories?.toString() || "")
        setValue("totalProtein", data.total_protein?.toString() || "")
        setValue("totalCarbohydrates", data.total_carbohydrates?.toString() || "")
        setValue("totalFats", data.total_fats?.toString() || "")
        setNutritionId(data.id)

        toast({
          title: "Nutrition Data Loaded",
          description: "Existing nutrition data has been loaded for this recipe.",
        })
      } else {
        // No existing data, reset form fields except recipe ID
        setValue("servingSize", "")
        setValue("totalCalories", "")
        setValue("totalProtein", "")
        setValue("totalCarbohydrates", "")
        setValue("totalFats", "")
        setNutritionId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load nutrition data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = getSupabase()

    try {
      const nutritionData = {
        recipe_id: data.recipeId,
        serving_size: data.servingSize,
        total_calories: data.totalCalories,
        total_protein: data.totalProtein,
        total_carbohydrates: data.totalCarbohydrates,
        total_fats: data.totalFats,
      }

      let result

      if (nutritionId) {
        // Update existing record
        result = await supabase.from("recipe_nutrition").update(nutritionData).eq("id", nutritionId)
      } else {
        // Insert new record
        result = await supabase.from("recipe_nutrition").insert(nutritionData)
      }

      if (result.error) throw result.error

      // If this was a new record, fetch the nutrition data to get the new ID
      if (!nutritionId) {
        await fetchNutritionData(data.recipeId)
      }

      toast({
        title: "Success",
        description: nutritionId
          ? "Nutrition information updated successfully."
          : "Nutrition information added successfully.",
      })

      // Don't reset the form after successful submission
      // This allows the user to see what they just submitted
    } catch (error) {
      console.error("Error saving nutrition information:", error)
      toast({
        title: "Error",
        description: "Failed to save nutrition information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecipeChange = (recipeId: string) => {
    setValue("recipeId", recipeId)
    fetchNutritionData(recipeId)
    setOpen(false)
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Spinner size="lg" aria-label="Loading recipes" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Recipe Nutrition</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="recipeId">Recipe</Label>
          <Controller
            name="recipeId"
            control={control}
            render={({ field }) => (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    {field.value ? recipes.find((recipe) => recipe.id === field.value)?.title : "Select a recipe..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search recipe..." />
                    <CommandList>
                      <CommandEmpty>No recipe found.</CommandEmpty>
                      <CommandGroup>
                        {recipes.map((recipe) => (
                          <CommandItem
                            key={recipe.id}
                            value={recipe.title}
                            onSelect={() => handleRecipeChange(recipe.id)}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", field.value === recipe.id ? "opacity-100" : "opacity-0")}
                            />
                            {recipe.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.recipeId && <p className="text-red-500 text-sm">{errors.recipeId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="servingSize">Serving Size</Label>
          <Controller
            name="servingSize"
            control={control}
            render={({ field }) => <Input id="servingSize" placeholder="e.g., 100g" {...field} />}
          />
          {errors.servingSize && <p className="text-red-500 text-sm">{errors.servingSize.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalCalories">Total Calories</Label>
          <Controller
            name="totalCalories"
            control={control}
            render={({ field }) => <Input id="totalCalories" placeholder="e.g., 250" {...field} />}
          />
          {errors.totalCalories && <p className="text-red-500 text-sm">{errors.totalCalories.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalProtein">Total Protein</Label>
          <Controller
            name="totalProtein"
            control={control}
            render={({ field }) => <Input id="totalProtein" placeholder="e.g., 10g" {...field} />}
          />
          {errors.totalProtein && <p className="text-red-500 text-sm">{errors.totalProtein.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalCarbohydrates">Total Carbohydrates</Label>
          <Controller
            name="totalCarbohydrates"
            control={control}
            render={({ field }) => <Input id="totalCarbohydrates" placeholder="e.g., 30g" {...field} />}
          />
          {errors.totalCarbohydrates && <p className="text-red-500 text-sm">{errors.totalCarbohydrates.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalFats">Total Fats</Label>
          <Controller
            name="totalFats"
            control={control}
            render={({ field }) => <Input id="totalFats" placeholder="e.g., 8g" {...field} />}
          />
          {errors.totalFats && <p className="text-red-500 text-sm">{errors.totalFats.message}</p>}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" aria-hidden="true" />
              {nutritionId ? "Updating..." : "Adding..."}
            </>
          ) : nutritionId ? (
            "Update Nutrition Information"
          ) : (
            "Add Nutrition Information"
          )}
        </Button>
      </form>
    </div>
  )
}

