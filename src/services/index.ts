// Core services
export { supabase } from './supabase';

// V2 Feature services
export { commentsService } from './comments.service';
export { ratingsService } from './ratings.service';
export { adminService } from './admin.service';
export { rateLimitService, checkRateLimit } from './rateLimit.service';
export { storageService } from './storage.service';
export { moderatorsService } from './moderators.service';

// Types
export type { Comment } from './comments.service';
export type { Rating, AnimeRating, TopRatedAnime } from './ratings.service';
export type { AdminStats } from './admin.service';
export type { RateLimit, ActionType } from './rateLimit.service';
export type { Moderator } from './moderators.service';
