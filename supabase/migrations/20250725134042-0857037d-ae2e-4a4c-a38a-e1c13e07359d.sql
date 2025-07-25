-- Check if the trigger exists and create it if missing
-- This trigger ensures a profile is created when a user signs up

-- First, let's recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert a few test users for testing
-- First test user (admin)
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Insert into auth.users if not exists
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        role
    )
    VALUES (
        '11111111-1111-1111-1111-111111111111'::uuid,
        'admin@test.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"name": "Test Admin"}',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Insert profile
    INSERT INTO public.profiles (
        user_id,
        name,
        role,
        subscription_level,
        two_factor_enabled
    )
    VALUES (
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Test Admin',
        'admin',
        'enterprise',
        false
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        subscription_level = EXCLUDED.subscription_level;
END $$;

-- Second test user (regular user)
DO $$
BEGIN
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        role
    )
    VALUES (
        '22222222-2222-2222-2222-222222222222'::uuid,
        'user@test.com',
        crypt('user123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"name": "Test User"}',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING;
    
    INSERT INTO public.profiles (
        user_id,
        name,
        role,
        subscription_level,
        two_factor_enabled
    )
    VALUES (
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Test User',
        'user',
        'basic',
        false
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        subscription_level = EXCLUDED.subscription_level;
END $$;