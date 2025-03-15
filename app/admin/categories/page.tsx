"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { useToast } from "@/hooks/use-toast"
import { getSupabase } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import toast from "react-hot-toast"

interface Category {
  id: string
  name: string
  slug: string
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    const supabase = getSupabase()
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to fetch categories")
    } else {
      setCategories(data || [])
    }
    setIsLoading(false)
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error('Category name is required')
      return
    }

    setIsSubmitting(true)
    const supabase = getSupabase()
    try {
      const slug = newCategory.slug || generateSlug(newCategory.name)

      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: newCategory.name, slug }])
        .select()

      if (error) {
        console.error("Supabase insert error:", error)
        if (error.code === "23505") {
          toast.error('A category with this name or slug already exists')
        } else {
          throw error
        }
      } else if (data) {
        toast.success('Category created successfully')
        setCategories([...categories, data[0]])
        setNewCategory({ name: "", slug: "" })
        setIsDialogOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error('Failed to create category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    setIsSubmitting(true)
    const supabase = getSupabase()
    try {
      const slug = editingCategory.slug || generateSlug(editingCategory.name)

      const { data, error } = await supabase
        .from("categories")
        .update({ name: editingCategory.name, slug })
        .eq("id", editingCategory.id)
        .select()

      if (error) {
        if (error.code === "23505") {
          toast.error('A category with this name or slug already exists')
        } else {
          throw error
        }
      } else if (data) {
        toast.success('Category updated successfully')
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? data[0] : cat)))
        setEditingCategory(null)
        setIsDialogOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error('Failed to update category. Please try again.');
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    const supabase = getSupabase()
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) {
        throw error
      }
      toast.success('Category deleted successfully')
      setCategories(categories.filter((cat) => cat.id !== id))
      router.refresh()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category. Please try again.")
    }
  }

  const handleNameChange = (value: string, isEditing = false) => {
    if (isEditing && editingCategory) {
      setEditingCategory({
        ...editingCategory,
        name: value,
        slug: generateSlug(value),
      })
    } else {
      setNewCategory({
        name: value,
        slug: generateSlug(value),
      })
    }
  }

  // Added pagination variables and functions.  These would need to be integrated with your data fetching.
  const CATEGORIES_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)
  const totalCategories = categories.length
  const totalPages = Math.ceil(totalCategories / CATEGORIES_PER_PAGE)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const paginatedCategories = categories.slice(
    (currentPage - 1) * CATEGORIES_PER_PAGE,
    currentPage * CATEGORIES_PER_PAGE,
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Spinner size="lg" aria-label="Loading categories" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCategory(null)
                setNewCategory({ name: "", slug: "" })
                setIsDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingCategory ? editingCategory.name : newCategory.name}
                  onChange={(e) => handleNameChange(e.target.value, !!editingCategory)}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={editingCategory ? editingCategory.slug : newCategory.slug}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <Button
                onClick={() => {
                  if (editingCategory) {
                    handleUpdateCategory()
                  } else {
                    handleCreateCategory()
                  }
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" aria-hidden="true" />
                    Saving...
                  </>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCategories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingCategory(category)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {(currentPage - 1) * CATEGORIES_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * CATEGORIES_PER_PAGE, totalCategories)} of {totalCategories} categories
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
    </div>
  )
}

