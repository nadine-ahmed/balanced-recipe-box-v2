-- Remove cuisine_id and description columns
ALTER TABLE public.recipes
DROP COLUMN IF EXISTS cuisine_id,
DROP COLUMN IF EXISTS description;

-- Add images column as a JSONB array
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;

-- Add a check constraint to ensure images is an array
ALTER TABLE public.recipes
ADD CONSTRAINT images_is_array CHECK (jsonb_typeof(images) = 'array');

-- Drop the foreign key constraint for cuisine_id if it exists
ALTER TABLE public.recipes
DROP CONSTRAINT IF EXISTS fk_cuisine;

-- Drop the cuisines table if it's no longer needed
DROP TABLE IF EXISTS public.cuisines;

