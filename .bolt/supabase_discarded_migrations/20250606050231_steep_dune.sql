/*
  # Sample Mentorship Data
  
  1. New Data
    - Adds mentorship profiles for existing users
  
  2. Changes
    - Updates existing data with more detailed information
*/

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
  ipfs_hash
)
VALUES
  -- Alexandria (Data Science Expert)
  ('00000000-0000-0000-0000-000000000001',
   'Data Science',
   'Machine Learning & AI',
   120,
   'USD',
   60,
   'Mon-Fri, 2-6pm',
   'Data scientist with 15 years of experience in machine learning, neural networks, and AI applications. Specialized in predictive modeling and natural language processing.',
   'Qm123456789abcdef'),
  
  -- Marcus (Full-Stack Developer)
  ('00000000-0000-0000-0000-000000000002',
   'Programming',
   'Full-Stack Development',
   95,
   'USD',
   45,
   'Wed-Sun, 10am-4pm',
   'Full-stack developer with extensive experience in React, Node.js, and cloud architectures. Helped scale multiple startups from concept to production.',
   'Qm987654321fedcba'),
  
  -- Sophia (UX Designer)
  ('00000000-0000-0000-0000-000000000003',
   'Design',
   'UX/UI & Psychology',
   110,
   'USD',
   60,
   'Tue-Sat, 12-8pm',
   'Award-winning UX designer with a background in cognitive psychology. Specializes in creating intuitive, accessible interfaces for complex applications.',
   'Qm567890abcdefg'),
  
  -- Julian (Music Theory)
  ('00000000-0000-0000-0000-000000000004',
   'Music',
   'Music Theory & Composition',
   80,
   'USD',
   45,
   'Mon-Wed, 6-10pm',
   'Classically trained composer with a modern approach to music theory. Teaches composition, arrangement, and production for all genres.',
   'Qm345678hijklmn'),
  
  -- Elena (Business & Entrepreneurship)
  ('00000000-0000-0000-0000-000000000005',
   'Business',
   'Entrepreneurship & Funding',
   150,
   'USD',
   90,
   'Thu-Sun, 9am-5pm',
   'Serial entrepreneur who has founded three successful tech startups. Expertise in business model development, fundraising, and strategic growth.',
   'Qm789012pqrstuv'),
  
  -- Raj (System Design)
  ('00000000-0000-0000-0000-000000000006',
   'Programming',
   'Algorithms & System Design',
   130,
   'USD',
   60,
   'Mon-Fri, 7-11pm',
   'Principal engineer at a major tech company with expertise in distributed systems and algorithm optimization. Author of two books on system design.',
   'Qm901234wxyzabc');