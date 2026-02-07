# Cache Configuration Summary

## Overview
This document summarizes the React Query cache configuration implemented for the advanced search and voice stats feature.

## Global Configuration (App.tsx)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000,    // 10 minutes - cache retention time
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('не найдено')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

## Feature-Specific Cache Configuration

### 1. Search Results (useSearch.ts)
- **staleTime**: 5 minutes
- **gcTime**: 10 minutes
- **Cache Key**: `['search', query, filters, page]`
- **Strategy**: Results are cached per unique combination of query, filters, and page

```typescript
const { data: searchData, isLoading, error } = useQuery<GroupedAnime[], Error>({
  queryKey: ['search', query, filters, page],
  queryFn: async () => { /* ... */ },
  enabled: query.length > 0 || Object.keys(filters).length > 0,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});
```

### 2. Voice Statistics (useVoiceStats.ts)
- **staleTime**: 5 minutes
- **gcTime**: 10 minutes
- **Cache Key**: `['voiceStats', animeId]`
- **Invalidation**: Cache is invalidated immediately after recording a voice selection

```typescript
const statsQuery = useQuery<VoiceStats[], Error>({
  queryKey: ['voiceStats', animeId],
  queryFn: () => voiceStatsService.getVoiceStats(animeId),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  enabled: animeId > 0,
});

// Cache invalidation on voice change
const recordSelectionMutation = useMutation({
  mutationFn: async (voiceName: string) => { /* ... */ },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['voiceStats', animeId] });
    queryClient.invalidateQueries({ queryKey: ['userVoiceSelection', animeId, user?.id] });
  },
});
```

### 3. Related Anime (useSearch.ts)
- **Cache Key**: `['relatedAnime', animeId]`
- **Strategy**: Cached separately when expanded, with longer retention

```typescript
queryClient.setQueryData<RelatedAnime[]>(
  ['relatedAnime', animeId],
  sortedRelated
);
```

## Cache Key Strategies

### Search Queries
- **Pattern**: `['search', query, filters, page]`
- **Rationale**: Each unique combination of search parameters gets its own cache entry
- **Benefit**: Users can navigate back and forth between searches without re-fetching

### Voice Stats
- **Pattern**: `['voiceStats', animeId]`
- **Rationale**: Stats are specific to each anime
- **Benefit**: Stats are shared across all users viewing the same anime

### User Voice Selection
- **Pattern**: `['userVoiceSelection', animeId, userId]`
- **Rationale**: User's selection is specific to both anime and user
- **Benefit**: Personalized data is cached separately

## Cache Invalidation

### Automatic Invalidation
- Voice stats are invalidated when a user records a new voice selection
- This ensures users see updated statistics immediately after their action

### Manual Invalidation
- Can be triggered via `queryClient.invalidateQueries()`
- Useful for admin actions or data corrections

## Performance Benefits

1. **Reduced API Calls**: Same queries within 5 minutes use cached data
2. **Faster Navigation**: Users can navigate back to previous searches instantly
3. **Better UX**: Loading states are minimized for cached data
4. **Bandwidth Savings**: Less data transfer for repeated queries

## Testing

Property-based tests verify:
- Same query within cache window doesn't trigger new API call
- Different queries trigger new API calls
- Different filters trigger new API calls
- Cached results are returned immediately on subsequent renders

See: `src/hooks/useSearch.property.test.tsx`

## Requirements Validation

✓ **Requirement 1.10**: Search results are cached for 5 minutes
✓ **Requirement 5.4**: Voice stats are cached for 5 minutes
✓ **Cache invalidation**: Implemented on voice change
✓ **Cache key strategies**: Implemented for search queries and filters
