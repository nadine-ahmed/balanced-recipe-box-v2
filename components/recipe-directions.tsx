export function RecipeDirections({ instructions }: { instructions: string[] }) {
  if (!instructions || instructions.length === 0) {
    return <p>No directions available for this recipe.</p>
  }

  return (
    <ol className="list-decimal list-inside space-y-4">
      {instructions.map((step, index) => (
        <li key={index} className="pl-2">
          {step}
        </li>
      ))}
    </ol>
  )
}

