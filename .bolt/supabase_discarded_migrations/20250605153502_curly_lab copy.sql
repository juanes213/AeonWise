/*
  # Add Sample Data for Courses and Mentorship Profiles

  1. Sample Courses
    - 6 courses across different categories and skill levels
    - Each course has a title, description, level, duration, modules, and image
  
  2. Sample Mentorship Profiles
    - 6 mentors with different specialties and experience levels
    - Each profile includes category, specialty, pricing, and availability
*/

-- Insert sample courses
INSERT INTO courses (title, description, level, duration, modules, category, image_url)
VALUES
  ('Introduction to Python Programming', 
   'Learn the fundamentals of Python programming, from basic syntax to building simple applications. Perfect for beginners with no prior coding experience.',
   'beginner', 6, 8, 'Programming', 
   'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg'),
  
  ('Web Development Fundamentals', 
   'Master the core technologies of web development: HTML, CSS, and JavaScript. Build responsive websites and understand modern web standards.',
   'beginner', 10, 12, 'Web Development', 
   'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg'),
  
  ('Graphic Design Principles', 
   'Explore the fundamental principles of graphic design, including typography, color theory, composition, and visual hierarchy.',
   'intermediate', 8, 10, 'Design', 
   'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg'),
  
  ('Data Science with Python', 
   'Learn how to analyze and visualize data using Python libraries like Pandas, NumPy, and Matplotlib. Apply statistical methods to real-world datasets.',
   'intermediate', 12, 15, 'Data Science', 
   'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg'),
  
  ('Advanced Machine Learning', 
   'Dive deep into machine learning algorithms, neural networks, and model optimization. Build and deploy sophisticated AI systems.',
   'advanced', 14, 18, 'AI & Machine Learning', 
   'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg'),
  
  ('Mobile App Development with React Native', 
   'Create cross-platform mobile applications using React Native. Learn component-based architecture and native module integration.',
   'intermediate', 10, 12, 'Mobile Development', 
   'https://images.pexels.com/photos/907489/pexels-photo-907489.jpeg');

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