/**
 * Client-Side Rate Limiter & Backoff Manager
 * Prevents bursts of requests from overwhelming the TMDB API or proxy,
 * and gracefully handles exponential backoff when 429 Too Many Requests is encountered.
 */

class ClientRateLimiter {
  constructor(maxRequestsPerSecond = 12) {
    this.maxTokens = maxRequestsPerSecond;
    this.tokens = maxRequestsPerSecond;
    this.refillRate = maxRequestsPerSecond / 1000; // tokens per ms
    this.lastRefill = Date.now();
    this.queue = [];
    this.processing = false;
    this.backoffDelay = 0;
  }

  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillRate,
    );
    this.lastRefill = now;
  }

  async acquire() {
    this.refill();

    // If we have backoff active (due to a previous 429), wait
    if (this.backoffDelay > 0) {
      const waitTime = this.backoffDelay;
      this.backoffDelay = 0;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.refill();
    }

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // Must queue
    return new Promise((resolve) => {
      const timeToWait = Math.ceil((1 - this.tokens) / this.refillRate);
      setTimeout(() => {
        this.tokens = Math.max(0, this.tokens - 1);
        resolve();
      }, timeToWait);
    });
  }

  /**
   * Execute an async action through the rate limiter
   */
  async execute(action) {
    await this.acquire();
    try {
      return await action();
    } catch (error) {
      // Check for 429 Too Many Requests
      if (error && (error.status === 429 || error.message?.includes("429"))) {
        console.warn("Rate limit reached (429), applying 1.5s backoff...");
        this.backoffDelay = 1500;
        await new Promise((resolve) => setTimeout(resolve, this.backoffDelay));
        return await action(); // Retry once
      }
      throw error;
    }
  }

  /**
   * Report backoff directive from server headers if available (Retry-After)
   */
  reportRateLimit(retryAfterSeconds = 2) {
    this.backoffDelay = Math.max(this.backoffDelay, retryAfterSeconds * 1000);
  }
}

export const rateLimiter = new ClientRateLimiter(12);

/**
 * Utility debounce function for inputs & search
 */
export const debounce = (func, waitMs = 300) => {
  let timeout;
  const debounced = function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), waitMs);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
};
