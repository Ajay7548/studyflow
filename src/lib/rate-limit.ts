interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface CheckRateLimitParams {
  /** Unique identifier for the rate limit bucket (e.g., user IP or ID). */
  key: string;
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Duration of the sliding window in milliseconds. */
  windowMs: number;
}

interface CheckRateLimitResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** Number of remaining requests in the current window. */
  remaining: number;
  /** Timestamp (ms) when the current window resets. */
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Removes expired entries from the in-memory store.
 * Called automatically on each rate limit check to prevent memory leaks.
 */
const cleanExpiredEntries = (): void => {
  const now = Date.now();

  for (const [key, entry] of Array.from(store.entries())) {
    if (entry.resetTime <= now) {
      store.delete(key);
    }
  }
};

/**
 * Checks whether a request is allowed under a sliding-window rate limit.
 *
 * Uses an in-memory Map for storage, making it suitable for single-process
 * deployments. For multi-instance setups, replace with Redis-backed storage.
 *
 * Expired entries are automatically cleaned on each invocation.
 *
 * @example
 * ```ts
 * const result = checkRateLimit({
 *   key: request.ip,
 *   limit: 10,
 *   windowMs: 60_000, // 10 requests per minute
 * });
 *
 * if (!result.allowed) {
 *   return new Response("Too many requests", { status: 429 });
 * }
 * ```
 */
export const checkRateLimit = ({
  key,
  limit,
  windowMs,
}: CheckRateLimitParams): CheckRateLimitResult => {
  cleanExpiredEntries();

  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetTime <= now) {
    const resetTime = now + windowMs;
    store.set(key, { count: 1, resetTime });

    return {
      allowed: true,
      remaining: limit - 1,
      resetTime,
    };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: limit - existing.count,
    resetTime: existing.resetTime,
  };
};
