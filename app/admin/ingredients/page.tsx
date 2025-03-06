"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { getSupabase } from "@/lib/supabase"
import { Check, ChevronsUpDown, Plus, Trash2, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  recipeId: z.string().nonempty("Recipe is required"),
  groupName: z.string().nonempty("Group name is required"),
  ingredients: z.string().nonempty("Ingredients are required"),
})

type FormData = z.infer<typeof formSchema>

type IngredientGroup = {
  id: string
  recipe_id: string
  group_name: string
  group_ingredients: string[]
}

export default function AdminIngredientsPage() {
  const [recipes, setRecipes] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([])
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

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
      groupName: "",
      ingredients: "",
    },
  })

  const watchRecipeId = watch("recipeId")

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    if (watchRecipeId) {
      setSelectedRecipe(watchRecipeId)
      fetchIngredientGroups(watchRecipeId)
      setValue("recipeId", watchRecipeId)
    }
  }, [watchRecipeId, setValue])

  const fetchRecipes = async () => {
    setLoading(true)
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
    setLoading(false)
  }

  const fetchIngredientGroups = async (recipeId: string) => {
    setLoading(true)
    const supabase = getSupabase()
    const { data, error } = await supabase.from("ingredients").select("*").eq("recipe_id", recipeId).order("group_name")

    if (error) {
      console.error("Error fetching ingredient groups:", error)
      toast({
        title: "Error",
        description: "Failed to fetch ingredient groups. Please try again.",
        variant: "destructive",
      })
      setIngredientGroups([])
    } else {
      setIngredientGroups(data || [])
    }
    setLoading(false)
    setEditingGroup(null)
    setIsAddingNew(false)
    reset({ recipeId, groupName: "", ingredients: "" })
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingGroup(null)
    reset({ recipeId: selectedRecipe || "", groupName: "", ingredients: "" })
  }

  const handleEdit = (group: IngredientGroup) => {
    setEditingGroup(group.id)
    setIsAddingNew(false)
    setValue("recipeId", group.recipe_id)
    setValue("groupName", group.group_name)
    setValue("ingredients", group.group_ingredients.join("\n"))
  }

  const handleDelete = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this ingredient group?")) {
      return
    }

    setLoading(true)
    const supabase = getSupabase()
    const { error } = await supabase.from("ingredients").delete().eq("id", groupId)

    if (error) {
      console.error("Error deleting ingredient group:", error)
      toast({
        title: "Error",
        description: "Failed to delete ingredient group. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Ingredient group deleted successfully.",
      })
      if (selectedRecipe) {
        fetchIngredientGroups(selectedRecipe)
      }
    }
    setLoading(false)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = getSupabase()

    try {
      const ingredientsArray = data.ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)

      const upsertData = {
        recipe_id: data.recipeId,
        group_name: data.groupName,
        group_ingredients: ingredientsArray,
      }

      // If editing, include the ID
      if (editingGroup) {
        Object.assign(upsertData, { id: editingGroup })
      }

      const { error } = await supabase.from("ingredients").upsert(upsertData, {
        onConflict: editingGroup ? "id" : "recipe_id,group_name",
        ignoreDuplicates: false,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: editingGroup ? "Ingredient group updated successfully." : "Ingredient group added successfully.",
      })

      if (selectedRecipe) {
        fetchIngredientGroups(selectedRecipe)
      }

      setEditingGroup(null)
      setIsAddingNew(false)
      reset({ recipeId: selectedRecipe || "", groupName: "", ingredients: "" })
    } catch (error) {
      console.error("Error adding/updating ingredient group:", error)
      toast({
        title: "Error",
        description: "Failed to add/update ingredient group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingGroup(null)
    setIsAddingNew(false)
    reset({ recipeId: selectedRecipe || "", groupName: "", ingredients: "" })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Recipe Ingredients</h1>

      <div className="mb-8">
        <Label htmlFor="recipeId">Select Recipe</Label>
        <Controller
          name="recipeId"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("w-full max-w-md justify-between", !field.value && "text-muted-foreground")}
                >
                  {field.value ? recipes.find((recipe) => recipe.id === field.value)?.title : "Select a recipe"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search recipes..." />
                  <CommandList>
                    <CommandEmpty>No recipe found.</CommandEmpty>
                    <CommandGroup>
                      {recipes.map((recipe) => (
                        <CommandItem
                          key={recipe.id}
                          onSelect={() => {
                            field.onChange(recipe.id)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", recipe.id === field.value ? "opacity-100" : "opacity-0")}
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
      </div>

      {selectedRecipe && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Ingredient Groups for {recipes.find((r) => r.id === selectedRecipe)?.title}
            </h2>
            <Button onClick={handleAddNew} disabled={isAddingNew || !!editingGroup}>
              <Plus className="h-4 w-4 mr-2" /> Add New Group
            </Button>
          </div>

          {loading && (
            <div className="py-8 flex justify-center">
              <Spinner aria-label="Loading ingredient groups" />
            </div>
          )}

          {!loading && ingredientGroups.length === 0 && !isAddingNew && (
            <p className="text-muted-foreground">No ingredient groups found for this recipe. Add one to get started.</p>
          )}

          {isAddingNew && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Ingredient Group</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Controller
                      name="groupName"
                      control={control}
                      render={({ field }) => <Input id="groupName" placeholder="Enter group name" {...field} />}
                    />
                    {errors.groupName && <p className="text-red-500 text-sm mt-1">{errors.groupName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                    <Controller
                      name="ingredients"
                      control={control}
                      render={({ field }) => (
                        <Textarea id="ingredients" placeholder="Enter ingredients, one per line" rows={5} {...field} />
                      )}
                    />
                    {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner size="sm" className="mr-2" aria-hidden="true" />
                          Saving...
                        </>
                      ) : (
                        "Add Group"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {!isAddingNew && ingredientGroups.length > 0 && (
            <Accordion type="multiple" className="w-full">
              {ingredientGroups.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                    <div className="flex items-center justify-between w-full">
                      <span>{group.group_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {group.group_ingredients.length} ingredients
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {editingGroup === group.id ? (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                        <div>
                          <Label htmlFor="groupName">Group Name</Label>
                          <Controller
                            name="groupName"
                            control={control}
                            render={({ field }) => <Input id="groupName" placeholder="Enter group name" {...field} />}
                          />
                          {errors.groupName && <p className="text-red-500 text-sm mt-1">{errors.groupName.message}</p>}
                        </div>

                        <div>
                          <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                          <Controller
                            name="ingredients"
                            control={control}
                            render={({ field }) => (
                              <Textarea
                                id="ingredients"
                                placeholder="Enter ingredients, one per line"
                                rows={5}
                                {...field}
                              />
                            )}
                          />
                          {errors.ingredients && (
                            <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading}>
                            {loading ? (
                              <>
                                <Spinner size="sm" className="mr-2" aria-hidden="true" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-4">
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Ingredients:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {group.group_ingredients.map((ingredient, idx) => (
                              <li key={idx}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(group)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(group.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </>
      )}
    </div>
  )
}

