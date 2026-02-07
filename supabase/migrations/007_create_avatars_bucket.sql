-- Migration 007: Create Avatars Storage Bucket
-- This migration sets up the Supabase Storage bucket for user avatars with RLS policies

-- ============================================
-- CREATE AVATARS BUCKET
-- ============================================
-- Insert the avatars bucket into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public access
  2097152, -- 2MB in bytes (2 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp'] -- Allowed file types
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES FOR AVATARS
-- ============================================
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view avatars (public bucket)
CREATE POLICY "Public avatars are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatars
-- The filename must match their user_id to ensure users can only upload their own avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Note: The storage.foldername function extracts the folder path from the file name
-- We expect avatar files to be stored as: {user_id}.{extension}
-- This ensures users can only manage their own avatar files
