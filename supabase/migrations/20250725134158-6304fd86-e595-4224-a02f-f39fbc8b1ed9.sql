-- Just recreate the trigger and fix the existing profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix the existing profile to ensure it's properly configured
UPDATE public.profiles 
SET 
  name = 'Admin User',
  role = 'admin',
  subscription_level = 'enterprise',
  two_factor_enabled = false,
  updated_at = now()
WHERE user_id = '6e7197fa-5e2f-41b1-af6f-ec234508bc9c';