-- For recipe_ratings table
CREATE POLICY "Users can insert their own ratings"
ON public.recipe_ratings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.recipe_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- For recipes table
CREATE POLICY "Anyone can read recipes"
ON public.recipes
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can update recipe ratings"
ON public.recipes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

