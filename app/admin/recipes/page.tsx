"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"
import { deleteRecipe } from "@/lib/actions"
import toast from 'react-hot-toast'

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [recipeToDelete, setRecipeToDelete] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecipes, setTotalRecipes] = useState(0)
  const pageSize = 10
  const RECIPES_PER_PAGE = pageSize // Added for consistency with updated pagination

  useEffect(() => {
    fetchRecipes(currentPage)
  }, [currentPage])

  async function fetchRecipes(page) {
    setLoading(true)
    try {
      // Calculate the range for pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // First, get the total count
      const { count, error: countError } = await supabase.from("recipes").select("*", { count: "exact", head: true })

      if (countError) throw countError

      // Calculate total pages
      const total = count || 0
      setTotalRecipes(total)
      setTotalPages(Math.ceil(total / pageSize))

      // Now fetch the paginated data
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          *,
          categories:recipe_categories(
            category_id,
            category:categories(id, name)
          )
        `)
        .order("title")
        .range(from, to)

      if (error) throw error

      // Transform the data to match the expected format
      const formattedRecipes = data.map((recipe) => ({
        ...recipe,
        categories: recipe.categories
          ? recipe.categories.map((c) => ({
            id: c.category.id,
            name: c.category.name,
          }))
          : [],
      }))

      setRecipes(formattedRecipes)
    } catch (e) {
      console.error("Error fetching recipes:", e)
      setError(e instanceof Error ? e.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe)
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!recipeToDelete) return

    setIsDeleting(true)

    try {
      const result = await deleteRecipe(recipeToDelete.id)

      if (result.success) {
        toast.success(`"${recipeToDelete.title}" has been successfully deleted.`)
        // Remove the recipe from the local state to update the UI immediately
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeToDelete.id))

        // If we deleted the last recipe on the page, go to the previous page
        if (recipes.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        } else {
          // Otherwise, refresh the current page
          fetchRecipes(currentPage)
        }
      } else {
        toast.error(result.error || "Failed to delete recipe")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
      setIsDialogOpen(false)
      setRecipeToDelete(null)
    }
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  if (loading && recipes.length === 0) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Spinner size="lg" aria-label="Loading recipes" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Recipes</h1>
          <p className="text-muted-foreground mt-1">View, edit, and manage your recipes</p>
        </div>
        <Link href="/admin/recipes/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Recipe
          </Button>
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Cooking Time</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={recipe.image_url || "/placeholder.svg"}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{recipe.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {recipe.categories &&
                        recipe.categories.map((category) => (
                          <Badge key={category.id} variant="secondary">
                            {category.name}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>{recipe.cooking_time} mins</TableCell>
                  <TableCell>{recipe.difficulty}</TableCell>
                  <TableCell>
                    {recipe.average_rating ? recipe.average_rating.toFixed(1) : "—"}
                    {recipe.total_ratings ? ` (${recipe.total_ratings})` : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/recipes/${recipe.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(recipe)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * RECIPES_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * RECIPES_PER_PAGE, totalRecipes)} of {totalRecipes} recipes
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{recipeToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner size="sm" className="mr-2" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <p>Total recipes: {totalRecipes}</p>
        <p>
          Current page: {currentPage} of {totalPages}
        </p>
        <p>Recipes per page: {pageSize}</p>
        <p>Recipes on this page: {recipes.length}</p>
      </div>
    </div>
  )
}

