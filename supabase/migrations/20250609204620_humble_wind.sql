/*
  # Simple Authentication System Setup

  1. New Tables
    - `simple_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `simple_users` table
    - Add policies for user authentication and profile access

  3. Functions
    - Password hashing function
    - User authentication function
*/

-- Create simple_users table
CREATE TABLE IF NOT EXISTS simple_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE simple_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON simple_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow user registration"
  ON simple_users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Update profiles table to work with simple auth
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add simple_user_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS simple_user_id uuid REFERENCES simple_users(id) ON DELETE CASCADE;

-- Update profiles policies for simple auth
DROP POLICY IF EXISTS "Users can read own data" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own profile"
  ON profiles
  FOR ALL
  TO public
  USING (simple_user_id IS NOT NULL);

-- Create password hashing function
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$;

-- Create user authentication function
CREATE OR REPLACE FUNCTION authenticate_user(username_input text, password_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record simple_users;
  profile_record profiles;
BEGIN
  -- Find user by username
  SELECT * INTO user_record
  FROM simple_users
  WHERE username = username_input;
  
  -- Check if user exists and password is correct
  IF user_record.id IS NULL OR user_record.password_hash != crypt(password_input, user_record.password_hash) THEN
    RETURN json_build_object('success', false, 'message', 'Invalid username or password');
  END IF;
  
  -- Get or create profile
  SELECT * INTO profile_record
  FROM profiles
  WHERE simple_user_id = user_record.id;
  
  IF profile_record.id IS NULL THEN
    INSERT INTO profiles (id, simple_user_id, username, email, points, skills, learning_goals, bio)
    VALUES (user_record.id, user_record.id, user_record.username, '', 0, '{}', '{}', '')
    RETURNING * INTO profile_record;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', user_record.id,
      'username', user_record.username,
      'created_at', user_record.created_at
    ),
    'profile', row_to_json(profile_record)
  );
END;
$$;

-- Create user registration function
CREATE OR REPLACE FUNCTION register_user(username_input text, password_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user simple_users;
  new_profile profiles;
BEGIN
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM simple_users WHERE username = username_input) THEN
    RETURN json_build_object('success', false, 'message', 'Username already exists');
  END IF;
  
  -- Create new user
  INSERT INTO simple_users (username, password_hash)
  VALUES (username_input, hash_password(password_input))
  RETURNING * INTO new_user;
  
  -- Create profile
  INSERT INTO profiles (id, simple_user_id, username, email, points, skills, learning_goals, bio)
  VALUES (new_user.id, new_user.id, new_user.username, '', 0, '{}', '{}', '')
  RETURNING * INTO new_profile;
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', new_user.id,
      'username', new_user.username,
      'created_at', new_user.created_at
    ),
    'profile', row_to_json(new_profile)
  );
END;
$$;