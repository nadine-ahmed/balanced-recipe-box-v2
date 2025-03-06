-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cuisines table
CREATE TABLE IF NOT EXISTS public.cuisines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert initial categories
INSERT INTO public.categories (name, slug) VALUES
('Breakfast', 'breakfast'),
('Lunch', 'lunch'),
('Dinner', 'dinner'),
('Dessert', 'dessert'),
('Snack', 'snack'),
('Appetizer', 'appetizer'),
('Salad', 'salad'),
('Soup', 'soup'),
('Main Course', 'main-course'),
('Side Dish', 'side-dish')
ON CONFLICT (name) DO NOTHING;

-- Insert initial cuisines
INSERT INTO public.cuisines (name, slug) VALUES
('Italian', 'italian'),
('Mexican', 'mexican'),
('Chinese', 'chinese'),
('Japanese', 'japanese'),
('Indian', 'indian'),
('French', 'french'),
('Thai', 'thai'),
('Greek', 'greek'),
('Spanish', 'spanish'),
('American', 'american')
ON CONFLICT (name) DO NOTHING;

-- Add foreign key constraints to the recipes table
ALTER TABLE public.recipes
ADD CONSTRAINT fk_category
FOREIGN KEY (category_id)
REFERENCES public.categories(id);

ALTER TABLE public.recipes
ADD CONSTRAINT fk_cuisine
FOREIGN KEY (cuisine_id)
REFERENCES public.cuisines(id);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuisines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Cuisines are viewable by everyone"
ON public.cuisines FOR SELECT
USING (true);

-- Only allow admins to insert, update, or delete categories and cuisines
CREATE POLICY "Admins can manage categories"
ON public.categories
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can manage cuisines"
ON public.cuisines
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

