/*
  # Sample User Data
  
  1. New Data
    - Adds initial user profiles
    - Adds course catalog
    - Adds mentorship profiles
  
  2. Changes
    - Updates existing data with more detailed information
*/

-- First, create the auth users
DO $$
BEGIN
  -- Create users in auth.users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    ('00000000-0000-0000-0000-000000000001', 'alexandria@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', 'marcus@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000003', 'sophia@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000004', 'julian@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000005', 'elena@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000006', 'raj@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());
END;
$$;

-- Then insert the profiles that reference the auth users
INSERT INTO profiles (id, username, email, points, skills, learning_goals, bio)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alexandria', 'alexandria@example.com', 850,
   ARRAY['Python', 'Machine Learning', 'Data Science', 'Statistics'],
   ARRAY['Design', 'Public Speaking', 'Leadership'],
   'Data scientist with 15 years of experience in machine learning and AI.'),
  
  ('00000000-0000-0000-0000-000000000002', 'Marcus', 'marcus@example.com', 650,
   ARRAY['JavaScript', 'React', 'Node.js', 'Web Development'],
   ARRAY['Python', 'Data Science', 'Machine Learning'],
   'Full-stack developer with extensive experience in React and Node.js.'),
  
  ('00000000-0000-0000-0000-000000000003', 'Sophia', 'sophia@example.com', 720,
   ARRAY['UX Design', 'Psychology', 'User Research', 'Prototyping'],
   ARRAY['JavaScript', 'Web Development', 'React'],
   'Award-winning UX designer with a background in cognitive psychology.'),
  
  ('00000000-0000-0000-0000-000000000004', 'Julian', 'julian@example.com', 450,
   ARRAY['Music Theory', 'Composition', 'Piano', 'Audio Production'],
   ARRAY['Marketing', 'Business', 'Social Media'],
   'Classically trained composer and music theory expert.'),
  
  ('00000000-0000-0000-0000-000000000005', 'Elena', 'elena@example.com', 850,
   ARRAY['Business Strategy', 'Entrepreneurship', 'Fundraising'],
   ARRAY['Data Analysis', 'Machine Learning'],
   'Serial entrepreneur with expertise in business development.'),
  
  ('00000000-0000-0000-0000-000000000006', 'Raj', 'raj@example.com', 820,
   ARRAY['System Design', 'Algorithms', 'Distributed Systems'],
   ARRAY['Machine Learning', 'Cloud Architecture'],
   'Principal engineer specializing in distributed systems.');