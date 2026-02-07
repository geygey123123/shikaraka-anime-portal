/**
 * Rate Limiting Utilities
 * 
 * This file contains client-side rate limiting helpers and documentation
 * for server-side rate limiting configuration.
 */

/**
 * Rate limit rules for different actions
 * These match the server-side limits defined in rateLimit.service.ts
 */
export const RATE_LIMITS = {
  // Server-side rate limits (enforced by Supabase)
  comment: { max: 5, window: 3600 }, // 5 per hour per user
  rating: { max: 20, window: 3600 }, // 20 per hour per user
  profile_update: { max: 10, window: 3600 }, // 10 per hour per user
  
  // Client-side rate limits (enforced in browser)
  registration: { max: 3, window: 3600 }, // 3 per hour per IP (tracked client-side)
} as const;

/**
 * Parse rate limit error message to extract remaining time
 * @param errorMessage - Error message from rate limit service
 * @returns Parsed error with remaining time if available
 */
export function parseRateLimitError(errorMessage: string): {
  isRateLimit: boolean;
  message: string;
  remainingMinutes?: number;
} {
  // Check if it's a rate limit error
  if (!errorMessage.includes('Слишком много действий')) {
    return { isRateLimit: false, message: errorMessage };
  }

  // Try to extract remaining time from message
  const timeMatch = errorMessage.match(/через (\d+) минут/);
  if (timeMatch) {
    const remainingMinutes = parseInt(timeMatch[1], 10);
    return {
      isRateLimit: true,
      message: errorMessage,
      remainingMinutes,
    };
  }

  // Default rate limit error without specific time
  return {
    isRateLimit: true,
    message: 'Слишком много действий. Попробуйте позже.',
  };
}

/**
 * Log suspicious activity for security monitoring
 * @param userId - User ID (if available)
 * @param actionType - Type of action that triggered rate limit
 * @param details - Additional details about the activity
 */
export function logSuspiciousActivity(
  userId: string | null,
  actionType: string,
  details?: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    actionType,
    message: 'Rate limit exceeded - suspicious activity detected',
    ...details,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('[Security] Suspicious activity:', logEntry);
  }

  // In production, this could send to a logging service
  // Example: Sentry, LogRocket, or custom analytics
  try {
    // Store in localStorage for debugging (limit to last 100 entries)
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 100) {
      logs.shift(); // Remove oldest entry
    }
    localStorage.setItem('security_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to log suspicious activity:', error);
  }
}

/**
 * Client-side registration attempt tracker
 * Tracks registration attempts in localStorage to prevent abuse
 * 
 * Note: For production, IP-based rate limiting should be configured
 * in Supabase Auth settings or using Edge Functions.
 */
export class RegistrationRateLimiter {
  private static readonly STORAGE_KEY = 'registration_attempts';
  private static readonly MAX_ATTEMPTS = RATE_LIMITS.registration.max;
  private static readonly WINDOW_MS = RATE_LIMITS.registration.window * 1000;

  /**
   * Check if registration is allowed
   * @returns true if registration is allowed, false otherwise
   */
  static canRegister(): { allowed: boolean; remainingTime?: number } {
    const attempts = this.getAttempts();
    const now = Date.now();

    // Filter out expired attempts
    const validAttempts = attempts.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );

    if (validAttempts.length >= this.MAX_ATTEMPTS) {
      const oldestAttempt = Math.min(...validAttempts);
      const remainingTime = Math.ceil((oldestAttempt + this.WINDOW_MS - now) / 60000);
      
      // Log suspicious activity
      logSuspiciousActivity(null, 'registration', {
        attempts: validAttempts.length,
        remainingTime,
      });
      
      return { allowed: false, remainingTime };
    }

    return { allowed: true };
  }

  /**
   * Record a registration attempt
   */
  static recordAttempt(): void {
    const attempts = this.getAttempts();
    const now = Date.now();

    // Add new attempt and filter out expired ones
    const validAttempts = [...attempts, now].filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );

    this.saveAttempts(validAttempts);
  }

  /**
   * Get registration attempts from localStorage
   */
  private static getAttempts(): number[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save registration attempts to localStorage
   */
  private static saveAttempts(attempts: number[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Failed to save registration attempts:', error);
    }
  }

  /**
   * Clear all registration attempts (for testing)
   */
  static clearAttempts(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear registration attempts:', error);
    }
  }
}

/**
 * Format remaining time for user-friendly display
 * @param minutes - Remaining time in minutes
 * @returns Formatted time string
 */
export function formatRemainingTime(minutes: number): string {
  if (minutes < 1) {
    return 'менее минуты';
  } else if (minutes === 1) {
    return '1 минуту';
  } else if (minutes < 5) {
    return `${minutes} минуты`;
  } else if (minutes < 60) {
    return `${minutes} минут`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'час' : 'часа'}`;
    }
    return `${hours} ${hours === 1 ? 'час' : 'часа'} ${remainingMinutes} минут`;
  }
}

/**
 * Server-Side Rate Limiting Configuration
 * 
 * For production deployment, configure the following in Supabase:
 * 
 * 1. Supabase Auth Rate Limiting:
 *    - Navigate to Authentication > Settings in Supabase Dashboard
 *    - Configure rate limits for sign-up endpoints
 *    - Recommended: 3 attempts per hour per IP
 * 
 * 2. Edge Functions (Optional):
 *    - Create an Edge Function to track IP-based registration attempts
 *    - Use Supabase Edge Functions with Deno KV for distributed rate limiting
 *    - Example: https://supabase.com/docs/guides/functions/rate-limiting
 * 
 * 3. Database Rate Limits:
 *    - Already implemented in rateLimit.service.ts
 *    - Enforced for: comments, ratings, profile updates
 *    - Uses rate_limits table in Supabase
 */
