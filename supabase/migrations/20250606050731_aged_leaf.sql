/*
  # Initial Schema Setup

  1. Tables
    - profiles
    - matches
    - mentorship_profiles
    - courses
    - enrollments
    - rank_history
    - rank_points

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  points integer DEFAULT 0,
  skills text[] DEFAULT '{}',
  learning_goals text[] DEFAULT '{}',
  bio text DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mentorship_profiles table
CREATE TABLE IF NOT EXISTS mentorship_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  specialty text NOT NULL,
  price integer NOT NULL,
  currency text DEFAULT 'USD',
  session_length integer DEFAULT 60,
  availability text NOT NULL,
  bio text NOT NULL,
  ipfs_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  level text NOT NULL,
  duration integer NOT NULL,
  modules integer NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create rank_history table
CREATE TABLE IF NOT EXISTS rank_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  old_rank text,
  new_rank text NOT NULL,
  points integer NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create rank_points table
CREATE TABLE IF NOT EXISTS rank_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  source text NOT NULL,
  points integer NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_points ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Matches
CREATE POLICY "Users can insert their own matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR (auth.uid() = matched_user_id));

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id) OR (auth.uid() = matched_user_id));

-- Mentorship Profiles
CREATE POLICY "Anyone can view mentorship profiles"
  ON mentorship_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own mentorship profile"
  ON mentorship_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentorship profile"
  ON mentorship_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Courses
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Enrollments
CREATE POLICY "Users can create their own enrollments"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Rank History
CREATE POLICY "Users can view their own rank history"
  ON rank_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Rank Points
CREATE POLICY "Users can view their own rank points"
  ON rank_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentorship_profiles_updated_at
  BEFORE UPDATE ON mentorship_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function for handling point decay
CREATE OR REPLACE FUNCTION handle_point_decay()
RETURNS TRIGGER AS $$
BEGIN
  -- Decay points by 1% for each day of inactivity (max 30%)
  IF NEW.last_activity IS DISTINCT FROM OLD.last_activity THEN
    NEW.points = GREATEST(0, OLD.points - (OLD.points * 0.01 * LEAST(30, EXTRACT(DAY FROM NOW() - OLD.last_activity))));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_point_decay_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.last_activity IS DISTINCT FROM NEW.last_activity)
  EXECUTE FUNCTION handle_point_decay();

-- Create function for handling rank changes
CREATE OR REPLACE FUNCTION handle_rank_change()
RETURNS TRIGGER AS $$
DECLARE
  old_rank text;
  new_rank text;
BEGIN
  -- Determine old rank
  old_rank = CASE
    WHEN OLD.points >= 1601 THEN 'cosmic_sage'
    WHEN OLD.points >= 1201 THEN 'galactic_guide'
    WHEN OLD.points >= 801 THEN 'comet_crafter'
    WHEN OLD.points >= 501 THEN 'astral_apprentice'
    WHEN OLD.points >= 251 THEN 'nebula_novice'
    ELSE 'starspark'
  END;

  -- Determine new rank
  new_rank = CASE
    WHEN NEW.points >= 1601 THEN 'cosmic_sage'
    WHEN NEW.points >= 1201 THEN 'galactic_guide'
    WHEN NEW.points >= 801 THEN 'comet_crafter'
    WHEN NEW.points >= 501 THEN 'astral_apprentice'
    WHEN NEW.points >= 251 THEN 'nebula_novice'
    ELSE 'starspark'
  END;

  -- If rank changed, record it
  IF old_rank <> new_rank THEN
    INSERT INTO rank_history (user_id, old_rank, new_rank, points)
    VALUES (NEW.id, old_rank, new_rank, NEW.points);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_rank_change_trigger
  AFTER UPDATE OF points ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_rank_change();