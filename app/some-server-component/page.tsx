import { createServerSupabaseClient } from "@/lib/supabase"

export default async function SomeServerComponent() {
  const supabase = createServerSupabaseClient()
  // Use supabase client here
  // ...
}

