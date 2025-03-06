"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

interface ImageUploaderProps {
  mainImageUrl: string | null
  additionalImages: string[]
  onMainImageChange: (url: string) => void
  onAdditionalImagesChange: (urls: string[]) => void
}

export function ImageUploader({
  mainImageUrl,
  additionalImages,
  onMainImageChange,
  onAdditionalImagesChange,
}: ImageUploaderProps) {
  const [newImageUrl, setNewImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      onAdditionalImagesChange([...additionalImages, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...additionalImages]
    newImages.splice(index, 1)
    onAdditionalImagesChange(newImages)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = getSupabase()

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage.from("recipe-images").upload(fileName, file)

      if (error) throw error

      const { data: urlData } = supabase.storage.from("recipe-images").getPublicUrl(data.path)

      onMainImageChange(urlData.publicUrl)
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="main_image_url">Main Image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="main_image_url"
            type="url"
            value={mainImageUrl || ""}
            onChange={(e) => onMainImageChange(e.target.value)}
            placeholder="https://example.com/main-image.jpg"
          />
          <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Additional Images</Label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL"
          />
          <Button type="button" onClick={handleAddImage} variant="secondary">
            Add Image
          </Button>
        </div>

        {additionalImages.length > 0 && (
          <div className="grid gap-4 mt-4">
            {additionalImages.map((url, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Recipe image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 truncate">{url}</div>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveImage(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

