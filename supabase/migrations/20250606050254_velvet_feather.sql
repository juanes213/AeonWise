/*
  # Sample Data Migration

  1. New Data
    - Sample users and profiles
    - Sample courses
    - Sample mentorship profiles
    - Sample matches and enrollments

  2. Changes
    - Creates auth users
    - Creates corresponding profiles
    - Adds sample course data
    - Sets up mentorship profiles
    - Creates matches between users
    - Creates course enrollments

  3. Security
    - Uses existing RLS policies
    - Maintains referential integrity
*/

-- First, create users in auth schema
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  encrypted_password
)
SELECT 
  uuid,
  email,
  NOW(),
  created_at,
  updated_at,
  json_build_object('username', username),
  crypt('password123', gen_salt('bf'))
FROM (
  VALUES 
    ('00000000-0000-0000-0000-000000000001', 'alexandria@example.com', 'Alexandria', NOW() - INTERVAL '120 days', NOW()),
    ('00000000-0000-0000-0000-000000000002', 'marcus@example.com', 'Marcus', NOW() - INTERVAL '90 days', NOW()),
    ('00000000-0000-0000-0000-000000000003', 'sophia@example.com', 'Sophia', NOW() - INTERVAL '110 days', NOW()),
    ('00000000-0000-0000-0000-000000000004', 'julian@example.com', 'Julian', NOW() - INTERVAL '70 days', NOW()),
    ('00000000-0000-0000-0000-000000000005', 'elena@example.com', 'Elena', NOW() - INTERVAL '45 days', NOW())
) AS t(uuid, email, username, created_at, updated_at)
ON CONFLICT (id) DO NOTHING;

-- Then create corresponding profiles
INSERT INTO profiles (
  id,
  username,
  email,
  points,
  skills,
  learning_goals,
  bio,
  created_at,
  updated_at
)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alexandria', 'alexandria@example.com', 850,
    ARRAY['Python', 'Machine Learning', 'Data Science', 'Statistics'],
    ARRAY['Design', 'Public Speaking', 'Leadership'],
    'Data scientist with 15 years of experience in machine learning, neural networks, and AI applications.',
    NOW() - INTERVAL '120 days',
    NOW()
  ),
  ('00000000-0000-0000-0000-000000000002', 'Marcus', 'marcus@example.com', 650,
    ARRAY['JavaScript', 'React', 'Node.js', 'Web Development'],
    ARRAY['Python', 'Data Science', 'Machine Learning'],
    'Full-stack developer with extensive experience in React, Node.js, and cloud architectures.',
    NOW() - INTERVAL '90 days',
    NOW()
  ),
  ('00000000-0000-0000-0000-000000000003', 'Sophia', 'sophia@example.com', 720,
    ARRAY['UX Design', 'Psychology', 'User Research', 'Prototyping'],
    ARRAY['JavaScript', 'Web Development', 'React'],
    'Award-winning UX designer with a background in cognitive psychology.',
    NOW() - INTERVAL '110 days',
    NOW()
  ),
  ('00000000-0000-0000-0000-000000000004', 'Julian', 'julian@example.com', 450,
    ARRAY['Music Theory', 'Composition', 'Piano', 'Audio Production'],
    ARRAY['Marketing', 'Business', 'Social Media'],
    'Classically trained composer and music theory expert.',
    NOW() - INTERVAL '70 days',
    NOW()
  ),
  ('00000000-0000-0000-0000-000000000005', 'Elena', 'elena@example.com', 320,
    ARRAY['Marketing', 'SEO', 'Content Creation', 'Social Media'],
    ARRAY['Data Analysis', 'Python', 'Business Intelligence'],
    'Marketing specialist focused on growth strategies for tech companies.',
    NOW() - INTERVAL '45 days',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (
  title,
  description,
  level,
  duration,
  modules,
  category,
  image_url,
  created_at
)
VALUES
  ('Introduction to Python Programming',
   'Learn the fundamentals of Python programming, from basic syntax to building simple applications.',
   'beginner', 6, 8, 'Programming',
   'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg',
   NOW() - INTERVAL '80 days'),
  ('Web Development Fundamentals',
   'Master the core technologies of web development: HTML, CSS, and JavaScript.',
   'beginner', 10, 12, 'Web Development',
   'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
   NOW() - INTERVAL '75 days'),
  ('Graphic Design Principles',
   'Explore the fundamental principles of graphic design.',
   'intermediate', 8, 10, 'Design',
   'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
   NOW() - INTERVAL '70 days'),
  ('Data Science with Python',
   'Learn how to analyze and visualize data using Python libraries.',
   'intermediate', 12, 15, 'Data Science',
   'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
   NOW() - INTERVAL '65 days'),
  ('Advanced Machine Learning',
   'Dive deep into machine learning algorithms and neural networks.',
   'advanced', 14, 18, 'AI & Machine Learning',
   'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
   NOW() - INTERVAL '60 days'),
  ('Mobile App Development with React Native',
   'Create cross-platform mobile applications using React Native.',
   'intermediate', 10, 12, 'Mobile Development',
   'https://images.pexels.com/photos/907489/pexels-photo-907489.jpeg',
   NOW() - INTERVAL '55 days');

-- Insert sample mentorship profiles
INSERT INTO mentorship_profiles (
  user_id,
  category,
  specialty,
  price,
  currency,
  session_length,
  availability,
  bio,
  ipfs_hash,
  created_at
)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Data Science',
   'Machine Learning & AI',
   120,
   'USD',
   60,
   'Mon-Fri, 2-6pm',
   'Data scientist with 15 years of experience in machine learning and AI.',
   'Qm123456789abcdef',
   NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0000-000000000002',
   'Programming',
   'Full-Stack Development',
   95,
   'USD',
   45,
   'Wed-Sun, 10am-4pm',
   'Full-stack developer with extensive experience in React and Node.js.',
   'Qm987654321fedcba',
   NOW() - INTERVAL '45 days'),
  ('00000000-0000-0000-0000-000000000003',
   'Design',
   'UX/UI & Psychology',
   110,
   'USD',
   60,
   'Tue-Sat, 12-8pm',
   'Award-winning UX designer specializing in intuitive interfaces.',
   'Qm567890abcdefg',
   NOW() - INTERVAL '40 days');

-- Insert sample matches
INSERT INTO matches (
  user_id,
  matched_user_id,
  status,
  created_at
)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'connected', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'pending', NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'connected', NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'connected', NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'pending', NOW() - INTERVAL '5 days');

-- Insert sample enrollments (after courses are created)
DO $$
DECLARE
  python_course_id uuid;
  design_course_id uuid;
  web_dev_course_id uuid;
  data_science_course_id uuid;
BEGIN
  -- Get course IDs
  SELECT id INTO python_course_id FROM courses WHERE title = 'Introduction to Python Programming' LIMIT 1;
  SELECT id INTO design_course_id FROM courses WHERE title = 'Graphic Design Principles' LIMIT 1;
  SELECT id INTO web_dev_course_id FROM courses WHERE title = 'Web Development Fundamentals' LIMIT 1;
  SELECT id INTO data_science_course_id FROM courses WHERE title = 'Data Science with Python' LIMIT 1;

  -- Insert enrollments
  INSERT INTO enrollments (user_id, course_id, progress, created_at)
  VALUES
    ('00000000-0000-0000-0000-000000000002', python_course_id, 35, NOW() - INTERVAL '40 days'),
    ('00000000-0000-0000-0000-000000000001', design_course_id, 20, NOW() - INTERVAL '30 days'),
    ('00000000-0000-0000-0000-000000000003', web_dev_course_id, 75, NOW() - INTERVAL '50 days'),
    ('00000000-0000-0000-0000-000000000004', data_science_course_id, 15, NOW() - INTERVAL '20 days'),
    ('00000000-0000-0000-0000-000000000005', python_course_id, 50, NOW() - INTERVAL '25 days');
END $$;