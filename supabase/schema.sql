-- ==============================================================================
-- DOLAP AI WARDROBE & VIRTUAL TRY-ON - FULL SUPABASE SQL MIGRATION
-- Tables, Constraints, Row Level Security (RLS) & Storage Policies
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    birthday DATE,
    height NUMERIC,
    body_type TEXT,
    styles TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'tr')),
    avatar_url TEXT,
    phone TEXT,
    onboarding_step INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create CLOTHING_ITEMS Table
CREATE TABLE IF NOT EXISTS public.clothing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    cutout_url TEXT,
    category TEXT NOT NULL, -- e.g., 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'
    subcategory TEXT,       -- e.g., 'T-Shirt', 'Jeans', 'Sneakers', 'Blazer'
    color TEXT,             -- e.g., 'Navy Blue', 'White', 'Beige'
    pattern TEXT,           -- e.g., 'Solid', 'Striped', 'Floral', 'Plaid'
    style TEXT,             -- e.g., 'Casual', 'Streetwear', 'Minimalist', 'Old Money'
    season TEXT,            -- e.g., 'All Season', 'Summer', 'Winter', 'Spring/Fall'
    occasion TEXT,          -- e.g., 'Casual', 'Work', 'Night Out', 'Sport'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create OUTFITS Table
CREATE TABLE IF NOT EXISTS public.outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_ids UUID[] NOT NULL DEFAULT '{}',
    occasion TEXT DEFAULT 'Casual',
    tryon_image_url TEXT,
    waist_level INTEGER DEFAULT 50 CHECK (waist_level >= 0 AND waist_level <= 100),
    is_favourite BOOLEAN DEFAULT FALSE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for PROFILES
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" 
ON public.profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

-- 7. RLS Policies for CLOTHING_ITEMS
CREATE POLICY "Users can view own clothing items" 
ON public.clothing_items FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clothing items" 
ON public.clothing_items FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clothing items" 
ON public.clothing_items FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clothing items" 
ON public.clothing_items FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 8. RLS Policies for OUTFITS
CREATE POLICY "Users can view own outfits" 
ON public.outfits FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits" 
ON public.outfits FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits" 
ON public.outfits FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits" 
ON public.outfits FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 9. Storage Buckets (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', false),
    ('clothes', 'clothes', false),
    ('tryons', 'tryons', false)
ON CONFLICT (id) DO NOTHING;

-- 10. Storage RLS Policies (Private signed URLs, user scoped by folder)
-- AVATARS
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CLOTHES
CREATE POLICY "Users can upload their own clothes images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'clothes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own clothes images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'clothes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own clothes images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'clothes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- TRYONS
CREATE POLICY "Users can upload their own tryon images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tryons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own tryon images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tryons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own tryon images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tryons' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 11. Helper trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, phone, language)
    VALUES (new.id, new.phone, 'en')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
