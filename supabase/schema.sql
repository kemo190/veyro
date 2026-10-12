-- ========================================================
-- Veyro Platform — Database Schema & Security (Supabase)
-- ========================================================

-- 1. Create Restaurants Table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    branch TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create User Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'restaurant_owner', 'employee')),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    order_ticket_image TEXT NOT NULL,
    receipt_image TEXT NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function: Non-recursive admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 6. PROFILES Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Allow users insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
USING (public.is_admin());

-- 7. RESTAURANTS Policies
DROP POLICY IF EXISTS "Allow authenticated read restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admins manage restaurants" ON public.restaurants;

CREATE POLICY "Allow authenticated read restaurants" 
ON public.restaurants FOR SELECT 
TO authenticated 
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage restaurants" 
ON public.restaurants FOR ALL 
USING (public.is_admin());

-- 8. ORDERS Policies
DROP POLICY IF EXISTS "View orders" ON public.orders;
DROP POLICY IF EXISTS "Insert orders" ON public.orders;

CREATE POLICY "View orders" 
ON public.orders FOR SELECT 
USING (
    restaurant_id IN (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid()) OR 
    public.is_admin()
);

CREATE POLICY "Insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid()) OR 
    public.is_admin()
);

-- 9. Storage Bucket: orders-media
INSERT INTO storage.buckets (id, name, public)
VALUES ('orders-media', 'orders-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies (Public view for app UI, Authenticated insert for staff)
DROP POLICY IF EXISTS "Public can view orders media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload orders media" ON storage.objects;

CREATE POLICY "Public can view orders media"
ON storage.objects FOR SELECT
USING (bucket_id = 'orders-media');

CREATE POLICY "Authenticated users can upload orders media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'orders-media');

