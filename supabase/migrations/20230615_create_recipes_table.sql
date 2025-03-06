-- Create the recipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructions JSONB NOT NULL,
    ingredients JSONB NOT NULL,
    cooking_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    image_url TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    category_id UUID,
    cuisine_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS recipes_category_id_idx ON public.recipes(category_id);
CREATE INDEX IF NOT EXISTS recipes_cuisine_id_idx ON public.recipes(cuisine_id);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Recipes are viewable by everyone"
ON public.recipes FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own recipes"
ON public.recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
ON public.recipes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
ON public.recipes FOR DELETE
USING (auth.uid() = user_id);

