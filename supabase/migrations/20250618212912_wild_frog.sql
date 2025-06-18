/*
  # Add extended profile fields to profiles table

  1. New Columns
    - `work_experience` (jsonb) - Array of work experience objects
    - `projects` (jsonb) - Array of project objects  
    - `certifications` (jsonb) - Array of certification objects

  2. Changes
    - Add three new JSONB columns to store structured profile data
    - Set default values to empty arrays to ensure consistency
    - These fields will store arrays of objects with detailed profile information

  3. Notes
    - Using JSONB for flexible schema and better query performance
    - Default empty arrays prevent null handling issues
    - Existing profiles will automatically get empty arrays for new fields
*/

-- Add work experience column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'work_experience'
  ) THEN
    ALTER TABLE profiles ADD COLUMN work_experience jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add projects column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'projects'
  ) THEN
    ALTER TABLE profiles ADD COLUMN projects jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add certifications column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE profiles ADD COLUMN certifications jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;