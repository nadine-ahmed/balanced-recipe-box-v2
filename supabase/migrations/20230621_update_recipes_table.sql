-- Update recipes table to ensure ingredients and instructions are stored as JSONB arrays
ALTER TABLE public.recipes
ALTER COLUMN ingredients TYPE JSONB USING ingredients::JSONB,
ALTER COLUMN instructions TYPE JSONB USING instructions::JSONB;

-- Add constraints to ensure ingredients and instructions are arrays
ALTER TABLE public.recipes
ADD CONSTRAINT ingredients_is_array CHECK (jsonb_typeof(ingredients) = 'array'),
ADD CONSTRAINT instructions_is_array CHECK (jsonb_typeof(instructions) = 'array');

