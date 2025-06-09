/*
  # Fix profiles table INSERT policy for user registration

  1. Security Changes
    - Drop the existing INSERT policy that uses `user_id` 
    - Create a new INSERT policy that correctly uses `id` field
    - This allows new users to create their own profile during signup

  The issue was that the existing policy checked `uid() = user_id` but the profiles
  table uses `id` as the primary key that should match the auth user's ID.
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own mentorship profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;

-- Create the correct INSERT policy for profiles
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);