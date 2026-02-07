# Implementation Plan: Advanced Search and Voice Stats

## Overview

This is an incremental update adding three interconnected features: enhanced search with anime grouping, voice statistics with recommendations, and advanced filtering. The implementation focuses on essential functionality with streamlined testing.

## Tasks

- [x] 1. Database setup and voice stats service
  - Create voice_stats table with UNIQUE constraint on (user_id, anime_id)
  - Add indexes for performance (anime_id, user_id+anime_id, voice_name)
  - Implement VoiceStatsService with recordVoiceSelection and getVoiceStats methods
  - Add RLS policies for voice_stats table
  - _Requirements: 2.6, 2.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 1.1 Write property test for voice selection upsert
    - **Property 12: Voice selection upsert behavior**
    - **Validates: Requirements 6.3, 6.4**
  
  - [x] 1.2 Write unit tests for voice stats service
    - Test recording voice selection for authenticated user
    - Test anonymous user cannot record selection
    - Test stats aggregation accuracy
    - _Requirements: 2.6, 2.7, 2.9, 6.6_

- [x] 2. Kodik player wrapper with postMessage security
  - Create KodikPlayerWrapper component with iframe rendering
  - Implement postMessage listener with origin validation (kodik.biz, anime.v0e.me)
  - Add TypeScript types for KodikMessageEvent (type: 'translation_change')
  - Extract translation from 'translation_change' events
  - Integrate with VoiceStatsService to record selections
  - Implement cache invalidation on voice change: queryClient.invalidateQueries(['voiceStats', animeId])
  - _Requirements: 2.1, 2.2, 2.5, 2.6, 6.7_
  
  - [ ]* 2.1 Write unit tests for KodikPlayerWrapper
    - Test origin validation rejects unauthorized origins
    - Test translation_change event handling
    - Test voice recording integration
    - _Requirements: 2.1, 2.2, 2.5, 6.7_

- [x] 3. Voice stats display and hook
  - Create useVoiceStats hook with React Query caching (5min staleTime)
  - Implement VoiceStatsTooltip component with hover trigger
  - Display stats sorted by popularity (descending count)
  - Calculate and display percentages for each voice
  - Show user's current selection if authenticated
  - _Requirements: 2.3, 2.4, 2.8, 2.9, 5.4_
  
  - [x] 3.1 Write property test for voice stats sorting
    - **Property 7: Voice stats sorting by popularity**
    - **Validates: Requirements 2.3**
  
  - [ ]* 3.2 Write property test for percentage calculation
    - **Property 8: Voice stats percentage calculation**
    - **Validates: Requirements 2.4**

- [x] 4. Enhanced search service with grouping
  - Extend shikimoriService with getRelatedAnime method
  - Implement searchWithFilters method with filter parameter mapping
  - Add GroupedAnime interface with isRoot field
  - Implement anime grouping logic (group sequels/prequels)
  - Determine isRoot based on popularity/score
  - Add lazy loading for related anime (fetch on expand only)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [x] 4.1 Write property test for related anime grouping
    - **Property 2: Related anime grouping and chronological ordering**
    - **Validates: Requirements 1.3, 1.4, 1.5**
  
  - [ ]* 4.2 Write unit tests for search service
    - Test search with empty query
    - Test lazy loading of related anime
    - Test grouping logic with various relation types
    - _Requirements: 1.1, 1.7, 1.8_

- [x] 5. Search UI component with debouncing
  - Create SearchComponent with input field and debounce (300ms)
  - Implement useSearch hook with React Query caching (5min staleTime)
  - Add expand/collapse functionality for grouped anime
  - Display related anime chronologically when expanded
  - Implement pagination (20 items per page)
  - Add loading states and error handling
  - _Requirements: 1.9, 5.1, 5.2, 5.3, 5.5, 5.6_
  
  - [ ]* 5.1 Write property test for search debouncing
    - **Property 5: Search debouncing**
    - **Validates: Requirements 5.3**

- [x] 6. Filter system implementation
  - Create SearchFilters interface (genres, year, kind, status)
  - Implement useFilters hook with state management
  - Create FilterPanel component with multi-select controls
  - Add genre checkboxes, year range inputs, kind/status dropdowns
  - Implement clear filters functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.9_
  
  - [x] 6.1 Write property test for combined filter application
    - **Property 15: Combined filter application**
    - **Validates: Requirements 3.6, 3.7, 3.8**

- [x] 7. Filter URL persistence
  - Implement URL query parameter encoding for filters
  - Add URL parameter decoding on component mount
  - Sync filter state with URL on filter changes
  - Handle browser back/forward navigation
  - _Requirements: 3.10_
  
  - [ ]* 7.1 Write property test for filter URL persistence
    - **Property 17: Filter URL persistence**
    - **Validates: Requirements 3.10**

- [x] 8. Cache configuration and optimization
  - Configure React Query cache times (search: 5min, voiceStats: 5min, relatedAnime: 30min)
  - Implement cache invalidation on voice change
  - Add cache key strategies for search queries and filters
  - Test cache hit/miss scenarios
  - _Requirements: 1.10, 5.4_
  
  - [x] 8.1 Write property test for search result caching
    - **Property 4: Search result caching**
    - **Validates: Requirements 1.10**

- [x] 9. Error handling and user feedback
  - Add error boundaries for search and voice stats components
  - Implement user-friendly error messages (Russian)
  - Add retry logic for API failures with exponential backoff
  - Handle rate limiting (429) with user notification
  - Add loading skeletons for better UX
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ]* 9.1 Write unit tests for error handling
    - Test API error scenarios (429, 404, 500)
    - Test network error handling
    - Test error message display
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Integration and final testing
  - Wire all components together in main search page
  - Test end-to-end search flow with filters
  - Test voice selection recording and stats update flow
  - Verify filter persistence across navigation
  - Test anonymous vs authenticated user flows
  - Verify cache invalidation works correctly
  - _Requirements: All requirements_
  
  - [ ]* 10.1 Write integration tests
    - Test complete search + filter + voice stats flow
    - Test cache behavior across components
    - Test error recovery scenarios
    - _Requirements: All requirements_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties (100+ iterations each)
- Unit tests validate specific examples and edge cases
- Focus on essential implementation - this is an incremental update
- Half of tests are optional to balance speed vs coverage
