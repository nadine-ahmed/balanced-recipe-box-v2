"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Comment {
  id: number
  user: string
  content: string
  date: string
}

export function RecipeComments({ recipeId }: { recipeId: string }) {
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: "Alice", content: "This recipe is amazing!", date: "2 days ago" },
    { id: 2, user: "Bob", content: "I loved the flavors in this dish.", date: "1 day ago" },
  ])
  const [newComment, setNewComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        user: "You",
        content: newComment,
        date: "Just now",
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
        <Button type="submit">Post Comment</Button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar>
              <AvatarFallback>{comment.user[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.user}</span>
                <span className="text-sm text-muted-foreground">{comment.date}</span>
              </div>
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

