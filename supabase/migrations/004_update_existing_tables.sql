-- Migration 004: Update Existing Tables for V2 Features
-- This migration adds new columns to favorites and profiles tables

-- ============================================
-- UPDATE FAVORITES TABLE
-- ============================================
-- Add watch_status column with default value
ALTER TABLE favorites 
ADD COLUMN watch_status TEXT DEFAULT 'plan_to_watch';

-- Add status_updated_at column
ALTER TABLE favorites 
ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add check constraint for valid watch_status values
ALTER TABLE favorites
ADD CONSTRAINT valid_watch_status 
CHECK (watch_status IN ('watching', 'plan_to_watch', 'completed', 'dropped', 'on_hold'));

-- ============================================
-- UPDATE PROFILES TABLE
-- ============================================
-- Add is_admin column with default false
ALTER TABLE profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Add bio column
ALTER TABLE profiles 
ADD COLUMN bio TEXT;

-- Add last_active column
ALTER TABLE profiles 
ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Note: avatar_url already exists in profiles table from migration 001
