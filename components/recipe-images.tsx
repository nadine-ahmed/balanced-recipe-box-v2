"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function RecipeImages({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="relative aspect-video cursor-pointer">
              <Image
                src={image || "/placeholder.svg"}
                alt={`Recipe image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                onClick={() => setSelectedImage(image)}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <div className="relative aspect-video">
              <Image
                src={selectedImage || image}
                alt={`Enlarged recipe image ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}

