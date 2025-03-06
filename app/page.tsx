import { Suspense } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryPills } from "@/components/category-pills"
import { RecipeGrid } from "./components/recipe-grid"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="relative mb-12 space-y-4">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-rose-100 opacity-30 -z-10 rounded-lg" />
        <div className="p-4">
          <h1 className="text-4xl font-bold tracking-tight">Discover Recipes</h1>
          <p className="text-muted-foreground mt-2">Find and share the best recipes from around the world</p>
          <div className="flex items-center gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search recipes..." className="pl-9" />
            </div>
            <Button>Search</Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <CategoryPills />

      {/* Recipe Grid */}
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          }
        >
          <RecipeGrid />
        </Suspense>
      </div>
    </main>
  )
}

