import { supabase } from "./supabase"
import type { Cuisine } from "@/types/supabase"

export async function getCuisines(): Promise<Cuisine[]> {
  const { data, error } = await supabase.from("cuisines").select("*").order("name")

  if (error) {
    console.error("Error fetching cuisines:", error)
    return []
  }

  return data || []
}

