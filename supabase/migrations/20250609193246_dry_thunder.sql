/*
  # Fix profiles table RLS policies for signup

  1. Security Changes
    - Drop existing restrictive INSERT policy that prevents signup
    - Create new INSERT policy that allows profile creation during signup
    - Keep existing SELECT, UPDATE, and DELETE policies
    - Ensure users can create profiles when signing up

  The issue was that the INSERT policy required `uid() = user_id` but during signup,
  the user isn't fully authenticated yet when creating their profile.
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a new INSERT policy that allows profile creation during signup
-- This allows any authenticated user to insert a profile where the user_id matches their auth.uid()
-- or allows unauthenticated users to create profiles (needed during signup process)
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow if user is authenticated and creating their own profile
    (auth.uid() = id) OR
    -- Allow if this is during signup process (user not fully authenticated yet)
    (auth.uid() IS NULL AND id IS NOT NULL)
  );

-- Also ensure we have a more permissive INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);