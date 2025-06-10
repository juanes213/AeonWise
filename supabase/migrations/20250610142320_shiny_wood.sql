-- Update auth configuration to disable email confirmation
-- This migration confirms any existing unconfirmed users

-- For any existing unconfirmed users, we can confirm them automatically
-- Only update email_confirmed_at as confirmed_at is a generated column
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Note: The actual email confirmation setting needs to be changed in the Supabase dashboard
-- Go to Authentication > Settings > Sign Up and turn OFF "Confirm email"
-- This will ensure new users don't need email confirmation