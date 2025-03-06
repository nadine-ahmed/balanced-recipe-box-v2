"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Category, RecipeCategory } from "@/types/recipe"
import { Trash2 } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface CategorySelectorProps {
  selectedCategories: RecipeCategory[]
  onChange: (categories: RecipeCategory[]) => void
}

export function CategorySelector({ selectedCategories, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("categories").select("*").order("name")
    if (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    } else {
      setCategories(data || [])
    }
  }

  const availableCategories = categories.filter(
    (cat) => !selectedCategories.some((selected) => selected.category_id === cat.id),
  )

  const addCategory = (categoryId: string) => {
    onChange([...selectedCategories, { category_id: categoryId, main_category: false }])
  }

  const removeCategory = (categoryId: string) => {
    onChange(selectedCategories.filter((cat) => cat.category_id !== categoryId))
  }

  const toggleMainCategory = (categoryId: string, isMain: boolean) => {
    onChange(
      selectedCategories.map((cat) => (cat.category_id === categoryId ? { ...cat, main_category: isMain } : cat)),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categories</h3>
        {availableCategories.length > 0 && (
          <Select onValueChange={addCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="w-[100px] text-center">Main</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedCategories.map((selectedCat) => {
            const category = categories.find((c) => c.id === selectedCat.category_id)
            if (!category) return null

            return (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedCat.main_category}
                    onCheckedChange={(checked) => toggleMainCategory(category.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="text-destructive hover:text-destructive-foreground"
                    onClick={() => removeCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

