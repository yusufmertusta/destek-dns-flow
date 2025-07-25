-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create enum for subscription levels  
CREATE TYPE public.subscription_level AS ENUM ('basic', 'pro', 'enterprise');

-- Create enum for domain status
CREATE TYPE public.domain_status AS ENUM ('active', 'inactive', 'pending');

-- Create enum for DNS record types
CREATE TYPE public.dns_record_type AS ENUM ('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV');

-- Create enum for DNS record status
CREATE TYPE public.dns_record_status AS ENUM ('active', 'inactive');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  subscription_level subscription_level NOT NULL DEFAULT 'basic',
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create domains table
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL UNIQUE,
  status domain_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create DNS records table
CREATE TABLE public.dns_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  type dns_record_type NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  ttl INTEGER NOT NULL DEFAULT 3600,
  site TEXT,
  status dns_record_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_records ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (is_admin());

-- Domains RLS policies
CREATE POLICY "Users can view their own domains" 
ON public.domains 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all domains" 
ON public.domains 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can create their own domains" 
ON public.domains 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create any domain" 
ON public.domains 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Users can update their own domains" 
ON public.domains 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all domains" 
ON public.domains 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Users can delete their own domains" 
ON public.domains 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any domain" 
ON public.domains 
FOR DELETE 
USING (is_admin());

-- DNS Records RLS policies  
CREATE POLICY "Users can view DNS records for their domains" 
ON public.dns_records 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.domains 
    WHERE domains.id = dns_records.domain_id 
    AND domains.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all DNS records" 
ON public.dns_records 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can create DNS records for their domains" 
ON public.dns_records 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.domains 
    WHERE domains.id = dns_records.domain_id 
    AND domains.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can create any DNS record" 
ON public.dns_records 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Users can update DNS records for their domains" 
ON public.dns_records 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.domains 
    WHERE domains.id = dns_records.domain_id 
    AND domains.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update all DNS records" 
ON public.dns_records 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Users can delete DNS records for their domains" 
ON public.dns_records 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.domains 
    WHERE domains.id = dns_records.domain_id 
    AND domains.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete any DNS record" 
ON public.dns_records 
FOR DELETE 
USING (is_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON public.domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dns_records_updated_at
  BEFORE UPDATE ON public.dns_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration (creates profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role, subscription_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'user'),
    COALESCE((NEW.raw_user_meta_data ->> 'subscription_level')::subscription_level, 'basic')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_domains_user_id ON public.domains(user_id);
CREATE INDEX idx_domains_domain_name ON public.domains(domain_name);
CREATE INDEX idx_dns_records_domain_id ON public.dns_records(domain_id);
CREATE INDEX idx_dns_records_type ON public.dns_records(type);

-- Insert sample admin user (will need to be created via Supabase auth first)
-- This is just the profile data - the auth user must be created separately