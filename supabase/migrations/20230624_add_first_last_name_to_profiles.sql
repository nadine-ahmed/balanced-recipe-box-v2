-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update existing rows to set first_name and last_name based on username
-- This is a basic example and might not work for all cases
UPDATE public.profiles
SET first_name = SPLIT_PART(username, ' ', 1),
    last_name = SPLIT_PART(username, ' ', 2)
WHERE username IS NOT NULL;

-- Create an index on first_name and last_name for faster queries
CREATE INDEX idx_profiles_names ON public.profiles(first_name, last_name);

