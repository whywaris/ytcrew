import { Redis } from "@upstash/redis";

/**
 * Initializes and exports the Upstash Redis client.
 * Used for caching YouTube Data API responses (e.g. 1hr TTL) and rate limiting.
 */
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.warn("Upstash Redis credentials are not configured in production.");
    }
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

export const redis = getRedisClient();

/**
 * Helper to fetch from cache or execute fallback fetcher and cache the result.
 * @param key Redis cache key
 * @param ttlSeconds Time-to-live in seconds (default 3600 = 1 hour)
 * @param fetcher Async function returning data if cache misses
 */
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number = 3600,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.error(`[Redis] Error fetching cache for key "${key}":`, err);
  }

  const freshData = await fetcher();

  try {
    if (freshData !== null && freshData !== undefined) {
      await redis.set(key, freshData, { ex: ttlSeconds });
    }
  } catch (err) {
    console.error(`[Redis] Error setting cache for key "${key}":`, err);
  }

  return freshData;
}
