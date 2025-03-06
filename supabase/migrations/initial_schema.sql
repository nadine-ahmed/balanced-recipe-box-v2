-- Create tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE cuisines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructions JSONB NOT NULL,
  ingredients JSONB NOT NULL,
  cooking_time INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  category_id UUID REFERENCES categories(id) NOT NULL,
  cuisine_id UUID REFERENCES cuisines(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(recipe_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions
CREATE FUNCTION get_recipe_rating(recipe_row recipes)
RETURNS FLOAT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating)::FLOAT, 0)
    FROM ratings
    WHERE recipe_id = recipe_row.id
  );
END;
$$;

-- Create computed column for average rating
ALTER TABLE recipes
ADD COLUMN average_rating FLOAT
GENERATED ALWAYS AS (get_recipe_rating(recipes)) STORED;

-- Create indexes
CREATE INDEX recipes_user_id_idx ON recipes(user_id);
CREATE INDEX recipes_category_id_idx ON recipes(category_id);
CREATE INDEX recipes_cuisine_id_idx ON recipes(cuisine_id);
CREATE INDEX ratings_recipe_id_idx ON ratings(recipe_id);

