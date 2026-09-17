/**
 * Multi-Tier Client API Cache & In-Flight Request Deduplication
 * Tier 1: In-Memory Map (Instant 0ms lookup during navigation)
 * Tier 2: sessionStorage (Persists across page refreshes within the same tab)
 * Deduplication: In-flight Promise sharing so concurrent components requesting
 * the exact same URL only trigger ONE network call.
 */

// In-memory cache storage
const memoryCache = new Map();

// In-flight active promises to prevent redundant duplicate network requests
const inFlightRequests = new Map();

// Default TTLs (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes (search results)
  MEDIUM: 20 * 60 * 1000, // 20 minutes (trending, now playing, discover)
  LONG: 60 * 60 * 1000, // 1 hour (details, credits, recommendations)
  STATIC: 24 * 60 * 60 * 1000, // 24 hours (genres, config)
};

const SESSION_PREFIX = "mstream_cache_";

/**
 * Clean up expired memory cache entries periodically
 */
const cleanupExpiredMemoryCache = () => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt && entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
};

/**
 * Get cached data by key
 */
export const getFromCache = (key) => {
  const now = Date.now();

  // Check Tier 1: In-memory
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (!entry.expiresAt || entry.expiresAt > now) {
      return entry.data;
    }
    memoryCache.delete(key);
  }

  // Check Tier 2: sessionStorage
  try {
    const raw = sessionStorage.getItem(`${SESSION_PREFIX}${key}`);
    if (raw) {
      const entry = JSON.parse(raw);
      if (!entry.expiresAt || entry.expiresAt > now) {
        // Promote back to Tier 1
        memoryCache.set(key, entry);
        return entry.data;
      }
      sessionStorage.removeItem(`${SESSION_PREFIX}${key}`);
    }
  } catch (err) {
    // sessionStorage disabled or quota exceeded
  }

  return null;
};

/**
 * Store data in cache with TTL
 */
export const setToCache = (key, data, ttlMs = CACHE_TTL.MEDIUM) => {
  const expiresAt = Date.now() + ttlMs;
  const entry = { data, expiresAt };

  // Set Tier 1
  memoryCache.set(key, entry);

  // Set Tier 2
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${key}`, JSON.stringify(entry));
  } catch (err) {
    // Handled gracefully: quota limit or private browsing mode
  }
};

/**
 * Higher-order fetch with caching + in-flight request deduplication
 * @param {string} url - URL or cache key
 * @param {Function} fetcher - Async function returning parsed data
 * @param {number} ttlMs - Cache expiration duration
 */
export const cachedFetch = async (url, fetcher, ttlMs = CACHE_TTL.MEDIUM) => {
  // 1. Check if already in cache
  const cached = getFromCache(url);
  if (cached !== null) {
    return cached;
  }

  // 2. Check if a request for this exact URL is already in-flight
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  // 3. Initiate request & store the shared promise
  const requestPromise = (async () => {
    try {
      const data = await fetcher();
      if (data) {
        setToCache(url, data, ttlMs);
      }
      return data;
    } finally {
      // Remove from in-flight once settled
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, requestPromise);
  return requestPromise;
};

/**
 * Invalidate specific cache key or all cache
 */
export const clearApiCache = (key) => {
  if (key) {
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(`${SESSION_PREFIX}${key}`);
    } catch (e) {}
  } else {
    memoryCache.clear();
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(SESSION_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch (e) {}
  }
};

// Periodic background cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupExpiredMemoryCache, 5 * 60 * 1000);
}
