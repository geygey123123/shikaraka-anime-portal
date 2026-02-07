-- Migration 006: Create Performance Indexes
-- This migration creates indexes for optimizing queries on new V2 tables

-- ============================================
-- COMMENTS TABLE INDEXES
-- ============================================
-- Index for querying comments by anime_id
CREATE INDEX idx_comments_anime_id ON comments(anime_id);

-- Index for querying comments by user_id
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Index for sorting comments by created_at
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Composite index for querying comments by anime_id and sorting by created_at
CREATE INDEX idx_comments_anime_created ON comments(anime_id, created_at DESC);

-- ============================================
-- RATINGS TABLE INDEXES
-- ============================================
-- Index for querying ratings by anime_id
CREATE INDEX idx_ratings_anime_id ON ratings(anime_id);

-- Composite index for querying user's rating for a specific anime
CREATE INDEX idx_ratings_user_anime ON ratings(user_id, anime_id);

-- ============================================
-- RATE_LIMITS TABLE INDEXES
-- ============================================
-- Composite index for querying rate limits by user and action type
CREATE INDEX idx_rate_limits_user_action ON rate_limits(user_id, action_type);

-- Index for querying rate limits by window_start
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- Composite index for efficient rate limit checks
CREATE INDEX idx_rate_limits_user_action_window ON rate_limits(user_id, action_type, window_start);

-- ============================================
-- MODERATORS TABLE INDEXES
-- ============================================
-- Index for querying moderators by user_id
CREATE INDEX idx_moderators_user_id ON moderators(user_id);

-- Index for querying moderators by email
CREATE INDEX idx_moderators_email ON moderators(email);
