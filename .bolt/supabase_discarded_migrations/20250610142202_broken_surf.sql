/*
  # Disable Email Confirmation

  This migration updates the authentication configuration to allow users to sign in immediately
  after registration without requiring email verification.

  1. Changes
    - Disables email confirmation requirement
    - Allows immediate sign-in after registration
    - Simplifies the user registration flow

  2. Security
    - Users can access the application immediately
    - No email verification step required
*/

-- Update auth configuration to disable email confirmation
-- This is typically done through the Supabase dashboard, but we can also handle it programmatically

-- Note: The actual email confirmation setting needs to be changed in the Supabase dashboard
-- Go to Authentication > Settings > Sign Up and turn OFF "Confirm email"

-- For any existing unconfirmed users, we can confirm them automatically
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now()
WHERE email_confirmed_at IS NULL 
  AND confirmed_at IS NULL;