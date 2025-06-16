/*
  # Course Progress and Audio System

  1. New Tables
    - `course_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `course_id` (text)
      - `lesson_id` (text)
      - `code` (text, user's code)
      - `completed` (boolean)
      - `completion_time` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `course_progress` table
    - Add policies for users to manage their own progress
*/

CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id text NOT NULL,
  lesson_id text NOT NULL,
  code text DEFAULT '',
  completed boolean DEFAULT false,
  completion_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own course progress"
  ON course_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_course_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_course_progress_updated_at();