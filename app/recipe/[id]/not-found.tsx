import Link from "next/link"

export default function RecipeNotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Recipe Not Found</h1>
      <p className="mb-8">Sorry, we couldn't find the recipe you're looking for. This could be because:</p>
      <ul className="list-disc list-inside mb-8 text-left max-w-md mx-auto">
        <li>The recipe ID is incorrect</li>
        <li>The recipe has been deleted</li>
        <li>There's an issue with our database connection</li>
      </ul>
      <Link href="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  )
}

