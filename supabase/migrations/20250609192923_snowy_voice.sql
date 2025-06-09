/*
  # Fix Profile RLS Policies for Signup

  1. Security Updates
    - Remove conflicting RLS policies on profiles table
    - Add proper policies that allow profile creation during signup
    - Ensure users can only create/update their own profiles
    - Allow public read access to profiles for matching functionality

  2. Changes
    - Drop existing conflicting policies
    - Create new comprehensive policies for INSERT, UPDATE, SELECT, DELETE
    - Ensure signup process works while maintaining security
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create comprehensive RLS policies for profiles table
-- Allow users to insert their own profile (critical for signup)
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile and view others for matching
CREATE POLICY "Users can view profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete only their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO public
  USING (auth.uid() = id);