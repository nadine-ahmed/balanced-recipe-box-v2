-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do anything" ON public.profiles;

-- Create simplified policies
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

