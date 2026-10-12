-- ========================================================
-- Veyro Platform — Optional Seed Data
-- Run this in Supabase SQL Editor if you want initial test branches
-- ========================================================

-- Insert sample branches
INSERT INTO public.restaurants (id, name, name_ar, slug, branch, phone, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Burger Craft', 'برجر كرافت', 'burger-craft', 'جدة - الروضة', '+966559876543', true),
    ('22222222-2222-2222-2222-222222222222', 'Veyro Test Kitchen', 'مطبخ فيرو التجريبي', 'veyro-kitchen', 'الرياض - العليا', '+966501234567', true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    branch = EXCLUDED.branch;
