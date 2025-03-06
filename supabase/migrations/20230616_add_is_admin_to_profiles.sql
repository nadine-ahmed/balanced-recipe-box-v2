-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create an index on the is_admin column for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Update the policy to allow admins to view all profiles
CREATE OR REPLACE POLICY "Allow admins to view all profiles" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id 
    FROM public.profiles 
    WHERE is_admin = true
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

