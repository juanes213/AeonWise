/*
  # Sample Data for AeonWise

  This migration inserts sample data for testing and demonstration purposes.
  
  1. Sample Users
    - 5 users with different ranks and skills
  
  2. Sample Matches
    - Skill swap matches between users
  
  3. Sample Mentorship Profiles
    - Mentorship profiles for 3 users
  
  4. Sample Courses
    - 6 courses in different categories and levels
  
  5. Sample Enrollments
    - Course enrollments for users
*/

-- Insert sample users (these are mapped to auth.users records that would be created during sign-up)
INSERT INTO profiles (id, username, email, points, skills, learning_goals, bio, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alexandria', 'alexandria@example.com', 850, 
   ARRAY['Python', 'Machine Learning', 'Data Science', 'Statistics'], 
   ARRAY['Design', 'Public Speaking', 'Leadership'], 
   'Data scientist with 15 years of experience in machine learning, neural networks, and AI applications. Specialized in predictive modeling and natural language processing.',
   NOW() - INTERVAL '120 days'),
  
  ('00000000-0000-0000-0000-000000000002', 'Marcus', 'marcus@example.com', 650, 
   ARRAY['JavaScript', 'React', 'Node.js', 'Web Development'], 
   ARRAY['Python', 'Data Science', 'Machine Learning'], 
   'Full-stack developer with extensive experience in React, Node.js, and cloud architectures. Helped scale multiple startups from concept to production.',
   NOW() - INTERVAL '90 days'),
  
  ('00000000-0000-0000-0000-000000000003', 'Sophia', 'sophia@example.com', 720, 
   ARRAY['UX Design', 'Psychology', 'User Research', 'Prototyping'], 
   ARRAY['JavaScript', 'Web Development', 'React'], 
   'Award-winning UX designer with a background in cognitive psychology. Specializes in creating intuitive, accessible interfaces for complex applications.',
   NOW() - INTERVAL '110 days'),
  
  ('00000000-0000-0000-0000-000000000004', 'Julian', 'julian@example.com', 450, 
   ARRAY['Music Theory', 'Composition', 'Piano', 'Audio Production'], 
   ARRAY['Marketing', 'Business', 'Social Media'], 
   'Classically trained composer with a modern approach to music theory. Teaches composition, arrangement, and production for all genres.',
   NOW() - INTERVAL '70 days'),
  
  ('00000000-0000-0000-0000-000000000005', 'Elena', 'elena@example.com', 320, 
   ARRAY['Marketing', 'SEO', 'Content Creation', 'Social Media'], 
   ARRAY['Data Analysis', 'Python', 'Business Intelligence'], 
   'Marketing specialist focused on growth strategies for tech companies. Background in content marketing and SEO optimization.',
   NOW() - INTERVAL '45 days');

-- Insert sample matches
INSERT INTO matches (user_id, matched_user_id, status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'connected', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'pending', NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'connected', NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'connected', NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'pending', NOW() - INTERVAL '5 days');

-- Insert sample mentorship profiles
INSERT INTO mentorship_profiles (user_id, category, specialty, price, session_length, availability, bio, ipfs_hash, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Data Science', 'Machine Learning & AI', 120, 60, 'Mon-Fri, 2-6pm',
   'Data scientist with 15 years of experience in machine learning, neural networks, and AI applications. Specialized in predictive modeling and natural language processing.',
   'Qm123456789abcdef', NOW() - INTERVAL '60 days'),
  
  ('00000000-0000-0000-0000-000000000002', 'Programming', 'Full-Stack Development', 95, 45, 'Wed-Sun, 10am-4pm',
   'Full-stack developer with extensive experience in React, Node.js, and cloud architectures. Helped scale multiple startups from concept to production.',
   'Qm987654321fedcba', NOW() - INTERVAL '45 days'),
  
  ('00000000-0000-0000-0000-000000000003', 'Design', 'UX/UI & Psychology', 110, 60, 'Tue-Sat, 12-8pm',
   'Award-winning UX designer with a background in cognitive psychology. Specializes in creating intuitive, accessible interfaces for complex applications.',
   'Qm567890abcdefg', NOW() - INTERVAL '40 days');

-- Insert sample courses
INSERT INTO courses (title, description, level, duration, modules, category, image_url, created_at)
VALUES
  ('Introduction to Python Programming', 
   'Learn the fundamentals of Python programming, from basic syntax to building simple applications. Perfect for beginners with no prior coding experience.',
   'beginner', 6, 8, 'Programming', 
   'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg',
   NOW() - INTERVAL '80 days'),
  
  ('Web Development Fundamentals', 
   'Master the core technologies of web development: HTML, CSS, and JavaScript. Build responsive websites and understand modern web standards.',
   'beginner', 10, 12, 'Web Development', 
   'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
   NOW() - INTERVAL '75 days'),
  
  ('Graphic Design Principles', 
   'Explore the fundamental principles of graphic design, including typography, color theory, composition, and visual hierarchy.',
   'intermediate', 8, 10, 'Design', 
   'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
   NOW() - INTERVAL '70 days'),
  
  ('Data Science with Python', 
   'Learn how to analyze and visualize data using Python libraries like Pandas, NumPy, and Matplotlib. Apply statistical methods to real-world datasets.',
   'intermediate', 12, 15, 'Data Science', 
   'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
   NOW() - INTERVAL '65 days'),
  
  ('Advanced Machine Learning', 
   'Dive deep into machine learning algorithms, neural networks, and model optimization. Build and deploy sophisticated AI systems.',
   'advanced', 14, 18, 'AI & Machine Learning', 
   'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
   NOW() - INTERVAL '60 days'),
  
  ('Mobile App Development with React Native', 
   'Create cross-platform mobile applications using React Native. Learn component-based architecture and native module integration.',
   'intermediate', 10, 12, 'Mobile Development', 
   'https://images.pexels.com/photos/907489/pexels-photo-907489.jpeg',
   NOW() - INTERVAL '55 days');

-- Insert sample enrollments
INSERT INTO enrollments (user_id, course_id, progress, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000002', 
   (SELECT id FROM courses WHERE title = 'Introduction to Python Programming'), 
   35, NOW() - INTERVAL '40 days'),
  
  ('00000000-0000-0000-0000-000000000001', 
   (SELECT id FROM courses WHERE title = 'Graphic Design Principles'), 
   20, NOW() - INTERVAL '30 days'),
  
  ('00000000-0000-0000-0000-000000000003', 
   (SELECT id FROM courses WHERE title = 'Web Development Fundamentals'), 
   75, NOW() - INTERVAL '50 days'),
  
  ('00000000-0000-0000-0000-000000000004', 
   (SELECT id FROM courses WHERE title = 'Data Science with Python'), 
   15, NOW() - INTERVAL '20 days'),
  
  ('00000000-0000-0000-0000-000000000005', 
   (SELECT id FROM courses WHERE title = 'Introduction to Python Programming'), 
   50, NOW() - INTERVAL '25 days');