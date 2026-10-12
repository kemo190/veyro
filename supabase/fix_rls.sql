-- ========================================================
-- Fix Supabase Infinite Recursion in RLS & Link Accounts
-- Run this script in the Supabase SQL Editor if needed
-- ========================================================

-- 1. Create a non-recursive SECURITY DEFINER function to check if caller is an admin
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

-- 2. Drop all old/restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Employees can view own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Admins can manage restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "View restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admins manage restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Allow authenticated read restaurants" ON public.restaurants;

DROP POLICY IF EXISTS "Employees can view their restaurant orders" ON public.orders;
DROP POLICY IF EXISTS "Employees can insert orders for their restaurant" ON public.orders;
DROP POLICY IF EXISTS "View orders" ON public.orders;
DROP POLICY IF EXISTS "Insert orders" ON public.orders;

-- 3. PROFILES Policies
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

-- 4. RESTAURANTS Policies (All authenticated staff can view active branches)
CREATE POLICY "Allow authenticated read restaurants" 
ON public.restaurants FOR SELECT 
TO authenticated 
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage restaurants" 
ON public.restaurants FOR ALL 
USING (public.is_admin());

-- 5. ORDERS Policies
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
