"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { getSupabase } from "@/lib/supabase"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MultiSelect } from "@/components/ui/multi-select"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  recipeId: z.string().nonempty("Recipe is required"),
  categories: z.array(z.string()).nonempty("At least one category is required"),
  mainCategory: z.string().nonempty("Main category is required"),
})

type FormData = z.infer<typeof formSchema>

export default function ManageRecipeCategoriesPage() {
  const [recipes, setRecipes] = useState<{ id: string; title: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipeId: "",
      categories: [],
      mainCategory: "",
    },
  })

  const watchCategories = watch("categories")

  useEffect(() => {
    fetchRecipes()
    fetchCategories()
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

  const fetchCategories = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("categories").select("id, name").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        variant: "destructive",
      })
    } else {
      setCategories(data || [])
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = getSupabase()

    try {
      // Remove existing categories for this recipe
      await supabase.from("recipe_categories").delete().eq("recipe_id", data.recipeId)

      // Add new categories
      const categoriesToInsert = data.categories.map((categoryId) => ({
        recipe_id: data.recipeId,
        category_id: categoryId,
        main_category: categoryId === data.mainCategory,
      }))

      const { error } = await supabase.from("recipe_categories").insert(categoriesToInsert)

      if (error) throw error

      toast({
        title: "Success",
        description: "Recipe categories updated successfully.",
      })
      reset()
    } catch (error) {
      console.error("Error updating recipe categories:", error)
      toast({
        title: "Error",
        description: "Failed to update recipe categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Spinner size="lg" aria-label="Loading data" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Recipe Categories</h1>
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
                            onSelect={() => {
                              setValue("recipeId", recipe.id)
                              setOpen(false)
                            }}
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
          <Label htmlFor="categories">Categories</Label>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                selected={field.value}
                onChange={field.onChange}
                placeholder="Select categories..."
              />
            )}
          />
          {errors.categories && <p className="text-red-500 text-sm">{errors.categories.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mainCategory">Main Category</Label>
          <Controller
            name="mainCategory"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {watchCategories.map((categoryId) => {
                    const category = categories.find((c) => c.id === categoryId)
                    return (
                      <SelectItem key={categoryId} value={categoryId}>
                        {category?.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mainCategory && <p className="text-red-500 text-sm">{errors.mainCategory.message}</p>}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" aria-hidden="true" />
              Updating...
            </>
          ) : (
            "Update Recipe Categories"
          )}
        </Button>
      </form>
    </div>
  )
}

