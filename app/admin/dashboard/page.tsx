import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Recipes</CardTitle>
            <CardDescription>Add, edit, or delete recipes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/recipes">
              <Button>Go to Recipes</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
            <CardDescription>Organize your recipe categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/categories">
              <Button>Go to Categories</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Ingredients</CardTitle>
            <CardDescription>Update your ingredient database</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/ingredients">
              <Button>Go to Ingredients</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Nutrition</CardTitle>
            <CardDescription>Add or update nutritional information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/manage-nutrition">
              <Button>Go to Nutrition</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Recipe Categories</CardTitle>
            <CardDescription>Assign categories to recipes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/manage-recipe-categories">
              <Button>Go to Recipe Categories</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

