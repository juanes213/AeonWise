DO $$ 
BEGIN
  -- Only insert courses if none exist
  IF NOT EXISTS (SELECT 1 FROM courses LIMIT 1) THEN
    INSERT INTO courses (title, description, level, duration, modules, category, image_url)
    VALUES
      ('Introduction to Python Programming', 
       'Learn the fundamentals of Python programming, from basic syntax to building simple applications. Perfect for beginners with no prior coding experience.',
       'beginner', 6, 8, 'Programming', 
       'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg');
    -- Add other courses as needed
  END IF;

  -- Only insert mentorship profiles if none exist
  IF NOT EXISTS (SELECT 1 FROM mentorship_profiles LIMIT 1) THEN
    -- Your existing mentorship profile insertion logic
    -- But wrapped in the existence check
  END IF;
END $$;