import type React from "react"
import Link from "next/link"
import { AdminAuthGuard } from "@/components/admin-auth-guard"
import { ToastProvider } from "@/components/ui/toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <ToastProvider>
        <div className="flex">
          <nav className="w-64 min-h-screen bg-gray-100 p-4">
            <ul>
              <li className="mb-2">
                <Link href="/admin/dashboard" className="text-blue-500 hover:underline">
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/recipes" className="text-blue-500 hover:underline">
                  Manage Recipes
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/categories" className="text-blue-500 hover:underline">
                  Manage Categories
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/ingredients" className="text-blue-500 hover:underline">
                  Manage Ingredients
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/manage-nutrition" className="text-blue-500 hover:underline">
                  Manage Nutrition
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/admin/manage-recipe-categories" className="text-blue-500 hover:underline">
                  Manage Recipe Categories
                </Link>
              </li>
            </ul>
          </nav>
          <main className="flex-1 p-4">{children}</main>
        </div>
      </ToastProvider>
    </AdminAuthGuard >
  )
}

