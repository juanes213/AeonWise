/*
  # Cosmic Ranking System Update

  1. Changes
    - Add rank_history table to track rank changes
    - Add last_activity column to profiles
    - Add rank_points table to track point sources
    - Update profiles table with new rank system
    - Add functions for point calculation and rank updates
    - Add triggers for point decay and rank updates

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add last_activity to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();

-- Create rank_history table
CREATE TABLE IF NOT EXISTS rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  old_rank TEXT,
  new_rank TEXT NOT NULL,
  points INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rank_points table
CREATE TABLE IF NOT EXISTS rank_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  points INT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_points ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own rank history"
  ON rank_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rank points"
  ON rank_points FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to calculate rank based on points
CREATE OR REPLACE FUNCTION calculate_cosmic_rank(points INT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN points >= 1601 THEN 'cosmic_sage'
    WHEN points >= 1201 THEN 'galactic_guide'
    WHEN points >= 801 THEN 'comet_crafter'
    WHEN points >= 501 THEN 'astral_apprentice'
    WHEN points >= 251 THEN 'nebula_novice'
    ELSE 'starspark'
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user is senior rank
CREATE OR REPLACE FUNCTION is_senior_rank(rank_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN rank_name IN ('cosmic_sage', 'galactic_guide', 'comet_crafter');
END;
$$ LANGUAGE plpgsql;

-- Create function to handle point decay
CREATE OR REPLACE FUNCTION handle_point_decay()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decay points if user has been inactive for 30 days
  IF NEW.last_activity < NOW() - INTERVAL '30 days' THEN
    -- Calculate decay amount (10 points per month of inactivity)
    DECLARE
      months_inactive INT := EXTRACT(MONTH FROM AGE(NOW(), NEW.last_activity));
      decay_amount INT := LEAST(months_inactive * 10, NEW.points);
      current_rank TEXT := calculate_cosmic_rank(NEW.points);
      new_points INT;
      rank_min_points INT;
    BEGIN
      -- Get minimum points for current rank
      rank_min_points := CASE current_rank
        WHEN 'cosmic_sage' THEN 1601
        WHEN 'galactic_guide' THEN 1201
        WHEN 'comet_crafter' THEN 801
        WHEN 'astral_apprentice' THEN 501
        WHEN 'nebula_novice' THEN 251
        ELSE 0
      END;
      
      -- Don't decay below rank minimum
      new_points := GREATEST(NEW.points - decay_amount, rank_min_points);
      
      -- Update points
      NEW.points := new_points;
      
      -- Record point decay
      INSERT INTO rank_points (
        user_id,
        source,
        points,
        details
      ) VALUES (
        NEW.id,
        'decay',
        -decay_amount,
        jsonb_build_object(
          'months_inactive', months_inactive,
          'previous_points', NEW.points + decay_amount
        )
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for point decay
CREATE TRIGGER handle_point_decay_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.last_activity IS DISTINCT FROM NEW.last_activity)
  EXECUTE FUNCTION handle_point_decay();

-- Create function to handle rank changes
CREATE OR REPLACE FUNCTION handle_rank_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new rank
  DECLARE
    new_rank TEXT := calculate_cosmic_rank(NEW.points);
    old_rank TEXT := calculate_cosmic_rank(OLD.points);
  BEGIN
    -- If rank changed, record it
    IF new_rank != old_rank THEN
      INSERT INTO rank_history (
        user_id,
        old_rank,
        new_rank,
        points,
        reason
      ) VALUES (
        NEW.id,
        old_rank,
        new_rank,
        NEW.points,
        CASE
          WHEN NEW.points > OLD.points THEN 'Points increased'
          ELSE 'Points decreased'
        END
      );
    END IF;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rank changes
CREATE TRIGGER handle_rank_change_trigger
  AFTER UPDATE OF points ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_rank_change();

-- Add function to award skill swap points
CREATE OR REPLACE FUNCTION award_skill_swap_points(user_id UUID)
RETURNS INT AS $$
DECLARE
  current_points INT;
  swap_points INT := 50;
  max_swap_points INT := 500;
  total_swap_points INT;
BEGIN
  -- Get total points from skill swaps
  SELECT COALESCE(SUM(points), 0)
  INTO total_swap_points
  FROM rank_points
  WHERE user_id = user_id AND source = 'skill_swap';
  
  -- If adding more points would exceed max, adjust or return 0
  IF total_swap_points + swap_points > max_swap_points THEN
    swap_points := GREATEST(0, max_swap_points - total_swap_points);
  END IF;
  
  -- If we can award points, do so
  IF swap_points > 0 THEN
    -- Add points to user's total
    UPDATE profiles
    SET points = points + swap_points
    WHERE id = user_id
    RETURNING points INTO current_points;
    
    -- Record point source
    INSERT INTO rank_points (
      user_id,
      source,
      points,
      details
    ) VALUES (
      user_id,
      'skill_swap',
      swap_points,
      jsonb_build_object(
        'total_swap_points', total_swap_points + swap_points,
        'max_reached', (total_swap_points + swap_points) >= max_swap_points
      )
    );
  END IF;
  
  RETURN swap_points;
END;
$$ LANGUAGE plpgsql;