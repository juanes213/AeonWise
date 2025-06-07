/*
  # Sample User Data

  1. New Data
    - Creates sample users in the auth.users table
    - Creates corresponding profiles in the public.profiles table
    - Creates mentorship profiles for expert users

  2. User Details
    - 6 sample users with different expertise areas
    - Each user has skills, learning goals, and bio
    - Mentorship profiles for teaching specific subjects
*/

-- First create the users in auth.users
INSERT INTO auth.users (id, email)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'alexandria@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'marcus@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'sophia@example.com'),
  ('00000000-0000-0000-0000-000000000004', 'julian@example.com'),
  ('00000000-0000-0000-0000-000000000005', 'elena@example.com'),
  ('00000000-0000-0000-0000-000000000006', 'raj@example.com')
ON CONFLICT (id) DO NOTHING;

-- Then create their profiles
INSERT INTO public.profiles (id, username, email, points, skills, learning_goals, bio)
SELECT 
  id,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 'Alexandria'
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 'Marcus'
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 'Sophia'
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 'Julian'
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 'Elena'
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 'Raj'
  END,
  email,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 850
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 650
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 720
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 450
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 850
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 820
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN ARRAY['Python', 'Machine Learning', 'Data Science', 'Statistics']
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN ARRAY['JavaScript', 'React', 'Node.js', 'Web Development']
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN ARRAY['UX Design', 'Psychology', 'User Research', 'Prototyping']
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN ARRAY['Music Theory', 'Composition', 'Piano', 'Audio Production']
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN ARRAY['Business Strategy', 'Entrepreneurship', 'Fundraising']
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN ARRAY['System Design', 'Algorithms', 'Distributed Systems']
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN ARRAY['Design', 'Public Speaking', 'Leadership']
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN ARRAY['Python', 'Data Science', 'Machine Learning']
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN ARRAY['JavaScript', 'Web Development', 'React']
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN ARRAY['Marketing', 'Business', 'Social Media']
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN ARRAY['Data Analysis', 'Machine Learning']
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN ARRAY['Machine Learning', 'Cloud Architecture']
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 'Data scientist with 15 years of experience in machine learning and AI.'
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 'Full-stack developer with extensive experience in React and Node.js.'
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 'Award-winning UX designer with a background in cognitive psychology.'
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 'Classically trained composer and music theory expert.'
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 'Serial entrepreneur with expertise in business development.'
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 'Principal engineer specializing in distributed systems.'
  END
FROM auth.users
WHERE auth.users.id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006'
)
ON CONFLICT (id) DO NOTHING;

-- Finally create their mentorship profiles
INSERT INTO mentorship_profiles (
  user_id,
  category,
  specialty,
  price,
  currency,
  session_length,
  availability,
  bio,
  ipfs_hash
)
SELECT
  id,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 'Data Science'
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 'Programming'
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 'Design'
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 'Music'
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 'Business'
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 'Programming'
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 'Machine Learning & AI'
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 'Full-Stack Development'
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 'UX/UI & Psychology'
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 'Music Theory & Composition'
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 'Entrepreneurship & Funding'
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 'Algorithms & System Design'
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 120
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 95
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 110
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 80
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 150
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 130
  END,
  'USD',
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 60
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 45
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 60
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 45
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 90
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 60
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 'Mon-Fri, 2-6pm'
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 'Wed-Sun, 10am-4pm'
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 'Tue-Sat, 12-8pm'
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 'Mon-Wed, 6-10pm'
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 'Thu-Sun, 9am-5pm'
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 'Mon-Fri, 7-11pm'
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 'Data scientist with 15 years of experience in machine learning, neural networks, and AI applications. Specialized in predictive modeling and natural language processing.'
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 'Full-stack developer with extensive experience in React, Node.js, and cloud architectures. Helped scale multiple startups from concept to production.'
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 'Award-winning UX designer with a background in cognitive psychology. Specializes in creating intuitive, accessible interfaces for complex applications.'
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 'Classically trained composer with a modern approach to music theory. Teaches composition, arrangement, and production for all genres.'
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 'Serial entrepreneur who has founded three successful tech startups. Expertise in business model development, fundraising, and strategic growth.'
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 'Principal engineer at a major tech company with expertise in distributed systems and algorithm optimization. Author of two books on system design.'
  END,
  CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' THEN 'Qm123456789abcdef'
    WHEN id = '00000000-0000-0000-0000-000000000002' THEN 'Qm987654321fedcba'
    WHEN id = '00000000-0000-0000-0000-000000000003' THEN 'Qm567890abcdefg'
    WHEN id = '00000000-0000-0000-0000-000000000004' THEN 'Qm345678hijklmn'
    WHEN id = '00000000-0000-0000-0000-000000000005' THEN 'Qm789012pqrstuv'
    WHEN id = '00000000-0000-0000-0000-000000000006' THEN 'Qm901234wxyzabc'
  END
FROM auth.users
WHERE auth.users.id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006'
)
ON CONFLICT (user_id) DO NOTHING;