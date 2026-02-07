# Implementation Plan: ShiKaraKa V2 Features

## Overview

Этот план реализует расширенные функции для ShiKaraKa аниме-портала, включая пагинацию, кастомизацию профилей, админ-панель, систему комментариев, собственную систему рейтингов, модерацию, защиту от ботов и расширенное управление избранным. Реализация следует существующей архитектуре с React, TypeScript, Supabase и Tailwind CSS.

## Tasks

- [x] 1. Database setup and migrations
  - [x] 1.1 Create new database tables
    - Create moderators table with RLS policies
    - Create comments table with RLS policies
    - Create ratings table with RLS policies
    - Create rate_limits table with RLS policies
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [x] 1.2 Update existing tables
    - Add watch_status and status_updated_at to favorites table
    - Add is_admin, avatar_url, bio, and last_active to profiles table
    - _Requirements: 10.5, 10.6_
  
  - [x] 1.3 Create database trigger for admin flag
    - Create set_admin_flag() function
    - Create on_auth_user_created trigger to auto-set is_admin for lifeshindo96@gmail.com
    - _Requirements: 3.8, 10.7_
  
  - [x] 1.4 Create database indexes
    - Create indexes for comments (anime_id, created_at), (user_id)
    - Create indexes for ratings (anime_id), (user_id, anime_id)
    - Create indexes for rate_limits (user_id, action_type, window_start)
    - Create indexes for moderators (user_id, email)
    - _Requirements: 10.8_
  
  - [x] 1.5 Set up Supabase Storage bucket for avatars
    - Create "avatars" bucket with public access
    - Configure size limit (2MB) and allowed file types (JPG, PNG, WebP)
    - Set up RLS policies for avatar uploads
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.7_

- [x] 2. Core services implementation
  - [x] 2.1 Implement CommentsService
    - Write getComments() method with pagination
    - Write addComment() method with rate limit check
    - Write deleteComment() method with moderator support
    - _Requirements: 5.1, 5.4, 5.8, 5.10_
  
  - [x] 2.2 Implement RatingsService
    - Write getRating() method with Bayesian average calculation
    - Write getUserRating() method
    - Write setRating() method with rate limit check
    - Write getTopRatedAnime() method
    - Write getGlobalAverage() helper method
    - Write calculateBayesianAverage() helper method
    - _Requirements: 7.1, 7.3, 7.5, 7.8, 7.10_
  
  - [x] 2.3 Implement AdminService
    - Write getStatistics() method
    - Write getTotalUsers(), getActiveUsers() helper methods
    - Write getTotalFavorites(), getTotalComments(), getTotalRatings() helper methods
    - Write getTopAnime() and getTopRated() methods
    - _Requirements: 3.3, 3.4_
  
  - [x] 2.4 Implement RateLimitService
    - Write checkRateLimit() method
    - Write updateRateLimit() helper method
    - Implement rate limit rules for all action types
    - Implement blocking logic for exceeded limits
    - _Requirements: 8.3, 8.5, 8.6, 8.7_
  
  - [x] 2.5 Implement StorageService for avatars
    - Write uploadAvatar() method with validation
    - Implement file size and type validation
    - Implement filename generation using user_id
    - Update profile with avatar_url after upload
    - _Requirements: 2.3, 2.4, 2.6, 2.7, 11.5, 11.6, 11.8_
  
  - [x] 2.6 Implement ModeratorsService
    - Write getModerators() method
    - Write addModerator() method with email validation
    - Write removeModerator() method
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3. React Query hooks implementation
  - [x] 3.1 Create useComments hooks
    - Implement useComments(animeId, page) query hook
    - Implement useAddComment() mutation hook with cache invalidation
    - Implement useDeleteComment() mutation hook with cache invalidation
    - _Requirements: 5.1, 5.4, 5.8_
  
  - [x] 3.2 Create useRatings hooks
    - Implement useAnimeRating(animeId) query hook
    - Implement useUserRating(animeId) query hook
    - Implement useSetRating() mutation hook with cache invalidation
    - _Requirements: 7.1, 7.3, 7.9_
  
  - [x] 3.3 Create useAdmin hooks
    - Implement useAdminStats() query hook with admin check
    - Implement useIsAdmin() hook
    - Implement useModerators() query hook
    - Implement useIsModerator() hook
    - _Requirements: 3.1, 3.3, 4.6_
  
  - [x] 3.4 Create useProfile hooks
    - Implement useProfile(userId) query hook
    - Implement useUpdateProfile() mutation hook
    - Implement useUploadAvatar() mutation hook
    - _Requirements: 2.1, 2.2, 2.3, 2.8_
  
  - [x] 3.5 Create useFavorites hooks updates
    - Update useFavorites to support watch_status filtering
    - Implement useUpdateWatchStatus() mutation hook
    - _Requirements: 9.2, 9.3, 9.5_
  
  - [x] 3.6 Create usePagination hook
    - Implement usePagination(initialPage) hook
    - Handle page state and navigation
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. UI Components - Pagination
  - [x] 4.1 Create Pagination component
    - Implement page navigation buttons (Previous/Next)
    - Display current page and total pages
    - Handle disabled states for first/last pages
    - Implement scroll to top on page change
    - Style with Modern Dark Cinema theme
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 4.2 Update Home page with pagination
    - Integrate Pagination component
    - Update anime fetching to use page parameter
    - Show skeleton screen during page loading
    - Implement React Query caching for pages
    - _Requirements: 1.2, 1.3, 1.6, 1.7_

- [x] 5. UI Components - Profile
  - [x] 5.1 Create ProfilePage component
    - Display user profile information
    - Show username, avatar, bio
    - Display user statistics (favorites count, comments count, ratings count)
    - _Requirements: 2.1_
  
  - [x] 5.2 Create ProfileEditor component
    - Create form for editing username and bio
    - Implement username validation (3-20 characters)
    - Add save button with loading state
    - Show success/error messages
    - _Requirements: 2.2, 2.5, 2.8_
  
  - [x] 5.3 Create AvatarUpload component
    - Implement file upload with drag-and-drop
    - Show avatar preview
    - Validate file size (max 2MB) and type (JPG, PNG, WebP)
    - Display upload progress
    - _Requirements: 2.3, 2.4, 2.6, 2.7_
  
  - [x] 5.4 Create ProfileStats component
    - Display user activity statistics
    - Show favorites count by watch status
    - Show total comments and ratings
    - _Requirements: 2.1_

- [x] 6. UI Components - Comments
  - [x] 6.1 Create CommentSection component
    - Display comments list with pagination
    - Show comment form for authenticated users
    - Show login prompt for unauthenticated users
    - Sort comments from newest to oldest
    - _Requirements: 5.1, 5.2, 5.3, 5.6_
  
  - [x] 6.2 Create CommentForm component
    - Create textarea for comment input
    - Implement character count (10-1000 characters)
    - Add submit button with loading state
    - Validate comment length
    - Handle rate limiting errors
    - _Requirements: 5.4, 5.5, 5.10_
  
  - [x] 6.3 Create CommentItem component
    - Display comment content, author, timestamp
    - Show author username and avatar
    - Add delete button for comment author
    - Add delete button for moderators/admins
    - Handle comment deletion
    - _Requirements: 5.7, 5.8, 5.9, 6.1_
  
  - [x] 6.4 Create CommentModeration component
    - Display list of recent comments for moderators
    - Add filtering options
    - Show delete actions for all comments
    - Display deleted comments with "[Комментарий удален модератором]"
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 6.5 Integrate CommentSection into anime detail page
    - Add CommentSection at bottom of anime detail page
    - Pass anime_id and user authentication state
    - _Requirements: 5.1_

- [x] 7. UI Components - Ratings
  - [x] 7.1 Create RatingDisplay component
    - Display weighted rating with star visualization
    - Show rating count
    - Display simple average for cards, Bayesian for detail pages
    - _Requirements: 7.1, 7.6, 7.10_
  
  - [x] 7.2 Create RatingInput component
    - Implement 10-star rating input
    - Add hover effects for rating preview
    - Highlight user's current rating
    - Handle disabled state during submission
    - _Requirements: 7.2, 7.3_
  
  - [x] 7.3 Create RatingStats component
    - Display rating distribution
    - Show average rating and vote count
    - _Requirements: 7.6_
  
  - [x] 7.4 Integrate rating components into anime detail page
    - Add RatingDisplay to show current rating
    - Add RatingInput for authenticated users
    - Handle rate limiting errors
    - Implement optimistic updates
    - _Requirements: 7.1, 7.2, 7.3, 7.8, 7.9_
  
  - [x] 7.5 Update anime cards to show internal ratings
    - Replace Shikimori ratings with internal ratings
    - Use simple average for card display
    - _Requirements: 7.7, 7.10_

- [x] 8. UI Components - Admin Panel
  - [x] 8.1 Create AdminPanel page
    - Check admin permissions (is_admin = true)
    - Display statistics dashboard
    - Show moderator management section
    - Protect route with admin check
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_
  
  - [x] 8.2 Create StatisticsCard component
    - Display individual stat with icon
    - Show stat value and label
    - Style with Modern Dark Cinema theme
    - _Requirements: 3.3_
  
  - [x] 8.3 Create UserActivityChart component
    - Implement chart using recharts library
    - Display user activity for last 30 days
    - Style chart with theme colors
    - _Requirements: 3.5_
  
  - [x] 8.4 Create TopAnimeList component
    - Display top 10 anime by favorites
    - Display top 10 anime by Bayesian rating
    - Show anime name, count/rating
    - Add links to anime detail pages
    - _Requirements: 3.3_
  
  - [x] 8.5 Create ModeratorManager component
    - Display list of current moderators
    - Add form to add new moderator by email
    - Implement email validation
    - Add remove moderator button
    - Prevent duplicate moderators
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 8.6 Add admin panel link to Header
    - Show admin panel link only for admins (is_admin = true)
    - Hide link for non-admin users
    - _Requirements: 3.1, 3.2_

- [x] 9. UI Components - Watch Status
  - [x] 9.1 Create WatchStatusSelector component
    - Implement dropdown with 5 watch statuses
    - Add icons and colors for each status
    - Handle status change
    - _Requirements: 9.1, 9.2_
  
  - [x] 9.2 Update FavoriteButton component
    - Add watch status selection when adding to favorites
    - Show current watch status for favorited anime
    - Allow changing watch status
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [x] 9.3 Update Favorites page with status tabs
    - Create tabs for each watch status
    - Filter anime by selected status
    - Show count for each status
    - Display date added and last status change
    - _Requirements: 9.3, 9.4, 9.6, 9.7_
  
  - [x] 9.4 Handle favorite removal across all statuses
    - Ensure delete works regardless of watch_status
    - _Requirements: 9.8_

- [x] 10. Security - CAPTCHA and Rate Limiting
  - [x] 10.1 Create CaptchaField component
    - Integrate hCaptcha or reCAPTCHA
    - Handle verification callback
    - Handle error states
    - _Requirements: 8.1, 8.2_
  
  - [x] 10.2 Add CAPTCHA to registration flow
    - Integrate CaptchaField into registration form
    - Validate CAPTCHA token before registration
    - Show error if CAPTCHA fails
    - _Requirements: 8.1, 8.2_
  
  - [x] 10.3 Implement rate limiting middleware
    - Apply rate limiting to registration (3/hour per IP)
    - Apply rate limiting to comments (5/hour per user)
    - Apply rate limiting to ratings (20/hour per user)
    - Apply rate limiting to profile updates (10/hour per user)
    - _Requirements: 8.3_
  
  - [x] 10.4 Implement rate limit error handling
    - Show "Слишком много действий. Попробуйте позже." message
    - Display remaining time until unblock
    - Log suspicious activity
    - _Requirements: 8.4, 8.5, 8.7_

- [-] 11. Performance optimizations
  - [x] 11.1 Implement caching strategy
    - Set admin stats cache to 5 minutes
    - Set comments cache to 2 minutes
    - Set ratings cache to 5 minutes
    - Set user profile cache to 10 minutes
    - Set moderators list cache to 10 minutes
    - _Requirements: 12.1, 12.5_
  
  - [x] 11.2 Implement pagination for comments
    - Load 20 comments per page
    - Add "Load more" or pagination controls
    - _Requirements: 12.2_
  
  - [x] 11.3 Implement virtualization for admin panel lists
    - Use react-window or similar for long lists
    - Apply to top anime lists
    - _Requirements: 12.3_
  
  - [x] 11.4 Implement debounce for search inputs
    - Add 300ms debounce to moderator search
    - _Requirements: 12.6_
  
  - [x] 11.5 Implement optimistic updates
    - Add optimistic updates for ratings
    - Add optimistic updates for comments
    - Add optimistic updates for watch status changes
    - _Requirements: 12.7_

- [x] 12. Checkpoint - Core functionality complete
  - Ensure all database tables are created and working
  - Verify all services are implemented and tested
  - Confirm all React Query hooks are functioning
  - Test rate limiting and CAPTCHA integration
  - Ensure all UI components render correctly

- [x] 12.1 Fix admin panel redirect issue
  - Update AdminPanel component to properly wait for admin status loading
  - Ensure isAdminLoading is checked before redirecting
  - Fix Header component to only show admin link after loading completes
  - Test that admin panel stays open and doesn't redirect to home
  - _Bug: Admin panel opens for 1 second then redirects to home_

- [x] 12.2 Fix page scrolling on anime detail and favorites pages
  - Add padding-bottom (pb-16) to AnimeDetail page container
  - Add padding-bottom (pb-16) to Favorites page container
  - Add padding-bottom (pb-16) to Home page container
  - Ensure all page content is scrollable to the bottom
  - Test that comment section and status tabs are fully accessible
  - _Bug: Cannot scroll to bottom of pages, content is cut off_

- [x] 12.3 Fix favorites status tabs horizontal scrolling
  - Add horizontal scroll container with proper overflow handling
  - Add padding-right (pr-4) to tabs container for full scroll
  - Add visible scrollbar styling with scrollbar-thin class
  - Ensure all status tabs (Все, Смотрю, Планирую, Завершено, Брошено, Отложено) are accessible
  - Test on mobile and desktop that tabs scroll smoothly
  - _Bug: Status tabs don't scroll, "Отложено" tab is not visible_

- [x] 12.4 Fix comments deletion 403 error
  - Execute RESET_COMMENTS_POLICIES.sql in Supabase to reset RLS policies
  - Verify policies allow users to delete their own comments
  - Verify policies allow admins/moderators to delete any comment
  - Clear browser cache after policy update
  - Test comment deletion works without 403 errors
  - _Bug: 403 error when trying to delete comments_

- [x] 12.5 Fix ratings 406 error
  - Check ratings table RLS policies in Supabase
  - Ensure SELECT policy allows authenticated users to read ratings
  - Ensure INSERT/UPDATE policies allow users to rate anime
  - Verify ratings.service.ts uses correct query format
  - Test that ratings load and save without 406 errors
  - _Bug: 406 error when loading user ratings_

- [x] 12.6 Fix rate limiting excessive blocking
  - Review rate limit settings in rateLimit.service.ts
  - Adjust comment rate limit from 5/hour to more reasonable limit
  - Adjust rating rate limit from 20/hour to more reasonable limit
  - Clear rate_limits table for testing: DELETE FROM rate_limits;
  - Test that rate limiting doesn't block normal usage
  - _Bug: Rate limiting blocks after 1 action with "1440 minutes" message_

- [x] 12.7 Create SQL script to reset all RLS policies
  - Create comprehensive SQL script to reset comments policies
  - Create SQL script to reset ratings policies
  - Create SQL script to verify all policies are correct
  - Document steps to clear browser cache after policy changes
  - _Support: Provide easy way to fix permission issues_

- [x] 13. Integration and styling
  - [x] 13.1 Apply Modern Dark Cinema theme to all new components
    - Use consistent color scheme (#ff0055 accent, dark backgrounds)
    - Apply consistent spacing and typography
    - Ensure responsive design for mobile
    - _Requirements: All UI requirements_
  
  - [x] 13.2 Add loading states and skeletons
    - Add skeleton screens for comments loading
    - Add spinners for avatar upload
    - Add disabled states for buttons during submission
    - _Requirements: 12.7_
  
  - [x] 13.3 Implement error handling and notifications
    - Add toast notifications for success/error
    - Implement real-time form validation
    - Show clear rate limiting error messages
    - Add fallback UI for loading errors
    - _Requirements: All requirements_
  
  - [x] 13.4 Update routing
    - Add /profile route
    - Add /admin route with admin guard
    - Add /moderation route with moderator guard
    - _Requirements: 3.1, 3.2, 4.6_

- [x] 14. Environment configuration
  - [x] 14.1 Add new environment variables
    - Add VITE_HCAPTCHA_SITE_KEY
    - Add VITE_ADMIN_EMAIL (lifeshindo96@gmail.com)
    - Document in .env.example
    - _Requirements: 8.1_
  
  - [x] 14.2 Install new dependencies
    - Install @hcaptcha/react-hcaptcha
    - Install recharts for admin charts
    - Install react-dropzone for avatar upload
    - Update package.json

- [x] 15. Testing
  - [x]* 15.1 Write unit tests for services
    - Test CommentsService methods
    - Test RatingsService methods including Bayesian calculation
    - Test AdminService statistics methods
    - Test RateLimitService logic
    - Test StorageService validation
    - _Requirements: All service requirements_
  
  - [x]* 15.2 Write unit tests for components
    - Test Pagination component
    - Test ProfileEditor component
    - Test CommentSection component
    - Test RatingInput component
    - Test AdminPanel component
    - Test WatchStatusSelector component
    - _Requirements: All UI requirements_
  
  - [x]* 15.3 Write integration tests
    - Test complete comment flow (add, view, delete)
    - Test complete rating flow (rate, update, view)
    - Test admin panel access and statistics
    - Test moderator management flow
    - Test profile update flow with avatar upload
    - Test watch status management flow
    - _Requirements: All requirements_
  
  - [x]* 15.4 Test rate limiting
    - Test comment rate limiting (5/hour)
    - Test rating rate limiting (20/hour)
    - Test registration rate limiting (3/hour)
    - Test blocking after limit exceeded
    - _Requirements: 8.3, 8.5_
  
  - [x]* 15.5 Test security and permissions
    - Test admin-only access to admin panel
    - Test moderator-only access to moderation panel
    - Test RLS policies for all tables
    - Test avatar upload permissions
    - _Requirements: 3.2, 3.6, 3.7, 4.6, 11.7_

- [x] 16. Final checkpoint - Complete system test
  - Verify all features work end-to-end
  - Test on multiple devices and browsers
  - Verify performance meets requirements
  - Ensure all rate limits are working
  - Confirm admin and moderator roles function correctly
  - Test CAPTCHA integration
  - Verify all database migrations are applied

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All new features follow existing Modern Dark Cinema design system
- TypeScript is used throughout for type safety
- React Query handles all data fetching and caching
- Supabase provides backend (database, auth, storage)
- Rate limiting protects against abuse
- Admin email (lifeshindo96@gmail.com) is hardcoded as per requirements
