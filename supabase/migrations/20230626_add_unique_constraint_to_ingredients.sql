-- Add a unique constraint to the ingredients table
ALTER TABLE public.ingredients
ADD CONSTRAINT ingredients_recipe_id_group_name_key UNIQUE (recipe_id, group_name);

