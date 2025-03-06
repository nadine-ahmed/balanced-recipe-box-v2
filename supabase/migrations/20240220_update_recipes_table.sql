-- Add average_rating and total_ratings columns if they don't exist
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Update the submit_rating function to handle null values
CREATE OR REPLACE FUNCTION public.submit_rating(
  p_recipe_id UUID,
  p_user_id UUID,
  p_rating INTEGER
)
RETURNS TABLE (new_average_rating DECIMAL, new_total_ratings INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_total_ratings INTEGER;
  v_current_average_rating DECIMAL;
  v_new_average_rating DECIMAL;
  v_new_total_ratings INTEGER;
BEGIN
  -- Start a transaction
  BEGIN
    -- Insert or update the rating
    INSERT INTO public.recipe_ratings (recipe_id, user_id, rating)
    VALUES (p_recipe_id, p_user_id, p_rating)
    ON CONFLICT (recipe_id, user_id)
    DO UPDATE SET rating = EXCLUDED.rating;

    -- Get current recipe data
    SELECT COALESCE(total_ratings, 0), COALESCE(average_rating, 0)
    INTO v_current_total_ratings, v_current_average_rating
    FROM public.recipes
    WHERE id = p_recipe_id;

    -- Calculate new values
    v_new_total_ratings := v_current_total_ratings + 1;
    v_new_average_rating := (v_current_average_rating * v_current_total_ratings + p_rating) / v_new_total_ratings;

    -- Update the recipe
    UPDATE public.recipes
    SET 
      total_ratings = v_new_total_ratings,
      average_rating = v_new_average_rating
    WHERE id = p_recipe_id;

    -- Return the new values
    RETURN QUERY SELECT v_new_average_rating, v_new_total_ratings::INTEGER;
  END;
END;
$$;

