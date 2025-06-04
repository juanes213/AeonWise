/*
  # Initial Schema for AeonWise

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique, not null)
      - `email` (text, unique, not null)
      - `points` (integer, default 0)
      - `skills` (text array, default empty)
      - `learning_goals` (text array, default empty)
      - `bio` (text, default empty)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp with time zone, default now)
      - `updated_at` (timestamp with time zone, default now)
    
    - `matches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `matched_user_id` (uuid, references profiles)
      - `status` (text, default 'pending')
      - `created_at` (timestamp with time zone, default now)
      - `updated_at` (timestamp with time zone, default now)
    
    - `mentorship_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `category` (text, not null)
      - `specialty` (text, not null)
      - `price` (integer, not null)
      - `currency` (text, default 'USD')
      - `session_length` (integer, default 60)
      - `availability` (text, not null)
      - `bio` (text, not null)
      - `ipfs_hash` (text, optional)
      - `created_at` (timestamp with time zone, default now)
      - `updated_at` (timestamp with time zone, default now)
    
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `level` (text, not null)
      - `duration` (integer, not null)
      - `modules` (integer, not null)
      - `category` (text, not null)
      - `image_url` (text, not null)
      - `created_at` (timestamp with time zone, default now)
      - `updated_at` (timestamp with time zone, default now)
    
    - `enrollments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (uuid, references courses)
      - `progress` (integer, default 0)
      - `created_at` (timestamp with time zone, default now)
      - `updated_at` (timestamp with time zone, default now)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  learning_goals TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  matched_user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mentorship profiles table
CREATE TABLE IF NOT EXISTS mentorship_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  specialty TEXT NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  session_length INTEGER DEFAULT 60,
  availability TEXT NOT NULL,
  bio TEXT NOT NULL,
  ipfs_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  duration INTEGER NOT NULL,
  modules INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Matches Policies
CREATE POLICY "Users can view their own matches"
  ON matches
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can insert their own matches"
  ON matches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON matches
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Mentorship Profiles Policies
CREATE POLICY "Anyone can view mentorship profiles"
  ON mentorship_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own mentorship profile"
  ON mentorship_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentorship profile"
  ON mentorship_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Courses Policies
CREATE POLICY "Anyone can view courses"
  ON courses
  FOR SELECT
  USING (true);

-- Enrollments Policies
CREATE POLICY "Users can view their own enrollments"
  ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
  ON enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
  ON enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentorship_profiles_updated_at
BEFORE UPDATE ON mentorship_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create a trigger function to create a profile after user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();