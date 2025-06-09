/*
  # Create profiles trigger for new user registration

  1. Trigger Function
    - Creates a profile automatically when a new user signs up
    - Ensures every authenticated user has a corresponding profile

  2. Security
    - Uses security definer to allow profile creation
    - Only triggers on user creation in auth.users table
*/

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, points, skills, learning_goals, bio)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    0,
    '{}',
    '{}',
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();