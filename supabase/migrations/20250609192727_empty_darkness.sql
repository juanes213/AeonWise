/*
  # Fix Profile Creation RLS Policy

  1. Security Policy Updates
    - Update the INSERT policy for profiles table to work with authenticated users
    - Ensure the policy allows profile creation during the signup process
    - Add a policy that allows profile creation for newly signed up users

  2. Changes Made
    - Drop existing INSERT policy that's causing issues
    - Create new INSERT policy for authenticated users
    - Ensure the policy works during the signup flow
*/

-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create a new INSERT policy that works for authenticated users during signup
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure there's a policy for public role during the signup process
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);