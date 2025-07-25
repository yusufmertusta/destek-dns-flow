-- Recreate the trigger to ensure profiles are created for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create test profiles for existing users using the Supabase signUp API
-- We'll ensure the existing user has the correct profile structure

-- Update the existing profile to make sure it's complete
UPDATE public.profiles 
SET 
  name = COALESCE(name, 'Admin User'),
  role = 'admin',
  subscription_level = 'enterprise',
  two_factor_enabled = false,
  updated_at = now()
WHERE user_id = '6e7197fa-5e2f-41b1-af6f-ec234508bc9c';

-- Create a simple test user profile that we can use for testing
-- This will be used for the admin@test.com user when they sign up via the app
INSERT INTO public.profiles (
  id,
  user_id,
  name,
  role,
  subscription_level,
  two_factor_enabled,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Test Admin',
  'admin',
  'enterprise',
  false,
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  subscription_level = EXCLUDED.subscription_level,
  updated_at = now();

-- Create a regular user profile for testing
INSERT INTO public.profiles (
  id,
  user_id,
  name,
  role,
  subscription_level,
  two_factor_enabled,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Test User',
  'user',
  'basic',
  false,
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  subscription_level = EXCLUDED.subscription_level,
  updated_at = now();