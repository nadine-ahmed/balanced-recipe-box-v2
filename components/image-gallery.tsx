"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { debounce } from "@/utils/debounce"
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [columns, setColumns] = useState(3)
  const galleryRef = useRef<HTMLDivElement>(null)

  const updateColumns = useCallback(() => {
    if (galleryRef.current) {
      const width = galleryRef.current.offsetWidth
      if (width < 640) setColumns(2)
      else if (width < 1024) setColumns(3)
      else setColumns(4)
    }
  }, [])

  useEffect(() => {
    updateColumns()
    const debouncedUpdateColumns = debounce(updateColumns, 250)
    window.addEventListener("resize", debouncedUpdateColumns)
    return () => window.removeEventListener("resize", debouncedUpdateColumns)
  }, [updateColumns])

  const openCarousel = (index: number) => {
    setCurrentImageIndex(index)
    setIsCarouselOpen(true)
  }

  const closeCarousel = useCallback(() => setIsCarouselOpen(false), [])

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCarouselOpen) {
        if (event.key === "ArrowRight") {
          nextImage()
        } else if (event.key === "ArrowLeft") {
          prevImage()
        } else if (event.key === "Escape") {
          closeCarousel()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCarouselOpen, closeCarousel, nextImage, prevImage])

  return (
    <div>
      <div
        ref={galleryRef}
        className={`grid gap-4 grid-cols-${columns} sm:grid-cols-${columns} md:grid-cols-${columns} lg:grid-cols-${columns}`}
      >
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square cursor-pointer" onClick={() => openCarousel(index)}>
            <Image
              src={image || "/placeholder.svg"}
              alt={`${alt} ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {isCarouselOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={closeCarousel}
            >
              <X size={24} />
              <span className="sr-only">Close</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              onClick={prevImage}
            >
              <ChevronLeft size={24} onClick={prevImage} />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              onClick={nextImage}
            >
              <ChevronRight size={24} onClick={nextImage} />
              <span className="sr-only">Next image</span>
            </Button>
            <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
              <Image
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={`${alt} ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

