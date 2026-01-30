interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

const REFILL_INTERVAL_MS = 1000;
const MAX_TOKENS = 100;

function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor((elapsed / REFILL_INTERVAL_MS) * MAX_TOKENS);

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
}

function getBucket(key: string): TokenBucket {
  const existing = buckets.get(key);

  if (existing) {
    refillBucket(existing);
    return existing;
  }

  const newBucket: TokenBucket = {
    tokens: MAX_TOKENS,
    lastRefill: Date.now(),
  };

  buckets.set(key, newBucket);
  return newBucket;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  limit: number = MAX_TOKENS
): RateLimitResult {
  const bucket = getBucket(key);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetAt: bucket.lastRefill + REFILL_INTERVAL_MS,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetAt: bucket.lastRefill + REFILL_INTERVAL_MS,
  };
}

export function getRateLimitKey(identifier: string, prefix: string = "rl"): string {
  return `${prefix}:${identifier}`;
}

