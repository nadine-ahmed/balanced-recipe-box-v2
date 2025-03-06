-- Create ratings table
CREATE TABLE IF NOT EXISTS public.recipe_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(recipe_id, user_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.recipe_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(recipe_id, user_id)
);

-- Add average_rating column to recipes table
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Create function to update average rating
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recipes
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM recipe_ratings
            WHERE recipe_id = NEW.recipe_id
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM recipe_ratings
            WHERE recipe_id = NEW.recipe_id
        )
    WHERE id = NEW.recipe_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
CREATE TRIGGER update_recipe_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON recipe_ratings
FOR EACH ROW
EXECUTE FUNCTION update_recipe_rating();

-- Enable RLS
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for ratings
CREATE POLICY "Users can view all ratings"
ON public.recipe_ratings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own ratings"
ON public.recipe_ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.recipe_ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for favorites
CREATE POLICY "Users can view their own favorites"
ON public.recipe_favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
ON public.recipe_favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.recipe_favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

