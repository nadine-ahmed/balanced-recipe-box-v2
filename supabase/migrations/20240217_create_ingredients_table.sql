-- Create new ingredients table
CREATE TABLE public.ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  item TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on recipe_id for faster queries
CREATE INDEX idx_ingredients_recipe_id ON public.ingredients(recipe_id);

-- Remove ingredients column from recipes table
ALTER TABLE public.recipes DROP COLUMN IF EXISTS ingredients;

-- Add RLS policies for ingredients table
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingredients are viewable by everyone"
ON public.ingredients FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert ingredients"
ON public.ingredients FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own recipe ingredients"
ON public.ingredients FOR UPDATE
USING (auth.uid() IN (
  SELECT user_id FROM recipes WHERE id = recipe_id
));

CREATE POLICY "Users can delete own recipe ingredients"
ON public.ingredients FOR DELETE
USING (auth.uid() IN (
  SELECT user_id FROM recipes WHERE id = recipe_id
));

