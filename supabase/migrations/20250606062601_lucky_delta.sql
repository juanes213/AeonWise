/*
  # Sample Course Data

  1. New Data
    - Adds initial course data to populate the courses table
    - Includes 6 sample courses across different categories
    - Each course has title, description, level, duration, modules, category, and image_url

  2. Course Details
    - Programming courses (Python, Web Development)
    - Design courses (Graphic Design)
    - Data Science & AI courses
    - Mobile Development courses
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