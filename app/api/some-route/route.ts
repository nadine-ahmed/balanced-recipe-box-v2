import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()
  // Use supabase here for server-side operations
  const { data, error } = await supabase.from("some_table").select("*")
  // ... handle the response
}

