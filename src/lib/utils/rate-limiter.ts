interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

export class RateLimiter {
  private attempts: Map<string, RateLimitEntry>;
  private readonly config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.attempts = new Map();
    this.config = config;
  }

  async isRateLimited(identifier: string): Promise<boolean> {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now
      });
      return false;
    }

    // Reset if window has passed
    if (now - entry.firstAttempt > this.config.windowMs) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now
      });
      return false;
    }

    // Increment counter
    entry.count++;
    this.attempts.set(identifier, entry);

    // Check if limit exceeded
    return entry.count > this.config.maxAttempts;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.attempts.entries());
    for (const [identifier, entry] of entries) {
      if (now - entry.firstAttempt > this.config.windowMs) {
        this.attempts.delete(identifier);
      }
    }
  }
} 