/*
  # Fix Authentication System

  1. Clean up conflicting authentication systems
    - Remove simple_users table and related functions
    - Ensure profiles table only references auth.users
    - Fix RLS policies for proper authentication flow

  2. Security
    - Ensure proper RLS policies on profiles table
    - Fix trigger functions for profile creation
    - Remove conflicting authentication methods
*/

-- Drop simple_users related functions and table
DROP FUNCTION IF EXISTS register_user(text, text);
DROP FUNCTION IF EXISTS authenticate_user(text, text);
DROP FUNCTION IF EXISTS hash_password(text);

-- Remove simple_user_id column from profiles if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'simple_user_id'
  ) THEN
    ALTER TABLE profiles DROP COLUMN simple_user_id;
  END IF;
END $$;

-- Drop simple_users table
DROP TABLE IF EXISTS simple_users;

-- Ensure profiles table has correct structure
DO $$
BEGIN
  -- Ensure id column references auth.users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'profiles' AND tc.constraint_type = 'FOREIGN KEY' 
    AND kcu.column_name = 'id' AND kcu.referenced_table_name = 'users'
  ) THEN
    -- Add foreign key constraint if it doesn't exist
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Clean up existing RLS policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO public
  USING (auth.uid() = id);

-- Ensure proper trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, points, skills, learning_goals, bio)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    0,
    '{}',
    '{}',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, profiles.username),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure auto-confirm function exists and works
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm the user's email
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure auto-confirm trigger exists
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_simple_user_id ON profiles(simple_user_id) WHERE simple_user_id IS NOT NULL;