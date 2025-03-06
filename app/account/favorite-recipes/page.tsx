import { Separator } from "@/components/ui/separator"
import { FavoriteRecipesList } from "@/components/favorite-recipes-list"

export default function FavoriteRecipesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Favorite Recipes</h3>
        <p className="text-sm text-muted-foreground">View and manage your favorite recipes.</p>
      </div>
      <Separator />
      <FavoriteRecipesList />
    </div>
  )
}

