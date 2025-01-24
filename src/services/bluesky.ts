import { AtpAgent } from '@atproto/api';

interface RateLimitState {
  points: number;
  lastReset: Date;
  requestCount: number;
  requestTimestamps: number[];
}

export class BlueSkyService {
  private readonly agent: AtpAgent;
  private currentCursor: string | undefined;
  private readonly rateLimitState: RateLimitState;
  private readonly MAX_REQUESTS_PER_5_MIN = 3000;
  private readonly POINTS_PER_OPERATION = {
    CREATE: 3,
    UPDATE: 2,
    DELETE: 1,
  };

  constructor() {
    console.debug('[BlueSky] Initializing service');
    this.agent = new AtpAgent({ service: 'https://bsky.social' });
    this.currentCursor = undefined;
    this.rateLimitState = {
      points: 0,
      lastReset: new Date(),
      requestCount: 0,
      requestTimestamps: [],
    };
  }

  private async checkRateLimit(operationType: keyof typeof this.POINTS_PER_OPERATION = 'CREATE') {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const points = this.POINTS_PER_OPERATION[operationType];

    // Add points to current total
    this.rateLimitState.points += points;

    // Reset points if last reset was over an hour ago
    if (now - this.rateLimitState.lastReset.getTime() > 60 * 60 * 1000) {
      this.rateLimitState.points = points;
      this.rateLimitState.lastReset = new Date();
    }

    // Check hourly point limit (5000)
    if (this.rateLimitState.points >= 5000) {
      const waitTime = 60 * 60 * 1000 - (now - this.rateLimitState.lastReset.getTime());
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.rateLimitState.points = points;
        this.rateLimitState.lastReset = new Date();
      }
    }

    // Existing request count logic...
    this.rateLimitState.requestTimestamps = this.rateLimitState.requestTimestamps.filter(
      timestamp => timestamp > fiveMinutesAgo,
    );

    // Check if we're approaching the rate limit
    if (this.rateLimitState.requestTimestamps.length >= this.MAX_REQUESTS_PER_5_MIN - 1) {
      const oldestTimestamp = this.rateLimitState.requestTimestamps[0] ?? now;
      const waitTime = Math.max(0, oldestTimestamp + 5 * 60 * 1000 - now);
      if (waitTime > 0) {
        console.debug(`[BlueSky] Rate limit approaching, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Add current request timestamp
    this.rateLimitState.requestTimestamps.push(now);
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries = 3,
    initialDelay = 1000,
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      await this.checkRateLimit();
      try {
        return await operation();
      } catch (error) {
        if (attempt === retries) throw error;

        const isRateLimit = (error as { status?: number }).status === 429;
        const delay = isRateLimit
          ? Math.min(initialDelay * Math.pow(2, attempt), 30000) // Max 30 second delay
          : initialDelay;

        console.debug(
          `[BlueSky] Operation failed, attempt ${attempt + 1}/${retries}, waiting ${delay}ms`,
          error,
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Operation failed after retries');
  }

  async login(identifier: string, password: string) {
    return this.executeWithRetry(async () => {
      console.debug('[BlueSky] Attempting login for:', identifier);
      await this.agent.login({ identifier, password });
      console.debug('[BlueSky] Login successful');
    });
  }

  async getUserPosts(resetCursor = false) {
    return this.executeWithRetry(async () => {
      console.debug('[BlueSky] Getting user posts, resetCursor:', resetCursor);
      if (resetCursor) {
        console.debug('[BlueSky] Resetting cursor');
        this.currentCursor = undefined;
      }

      const did = this.agent.session?.did || '';
      console.debug('[BlueSky] Fetching posts for DID:', did, 'with cursor:', this.currentCursor);

      const response = await this.agent.getAuthorFeed({
        actor: did,
        cursor: this.currentCursor,
        limit: 30,
      });

      this.currentCursor = response.data.cursor;
      return {
        feed: response.data.feed,
        hasMore: !!response.data.cursor,
      };
    });
  }

  async deletePost(uri: string, isRepost: boolean) {
    return this.executeWithRetry(async () => {
      await this.checkRateLimit('DELETE');
      console.debug('[BlueSky] Attempting to delete:', { uri, isRepost });
      if (isRepost) {
        await this.agent.deleteRepost(uri);
        console.debug('[BlueSky] Repost deleted');
      } else {
        await this.agent.deletePost(uri);
        console.debug('[BlueSky] Post deleted');
      }
    });
  }

  async repost(uri: string, cid: string) {
    return this.executeWithRetry(async () => {
      console.debug('[BlueSky] Attempting to repost:', uri);
      await this.agent.repost(uri, cid);
      console.debug('[BlueSky] Repost successful');
    });
  }

  // Helper method for batch operations with rate limiting
  async batchDelete(items: Array<{ uri: string; isRepost: boolean }>) {
    console.debug(`[BlueSky] Starting batch deletion of ${items.length} items`);
    const results: Array<{ uri: string; success: boolean; error?: unknown }> = [];

    for (const item of items) {
      try {
        await this.deletePost(item.uri, item.isRepost);
        results.push({ uri: item.uri, success: true });
      } catch (error) {
        console.error(`[BlueSky] Failed to delete ${item.uri}:`, error);
        results.push({ uri: item.uri, success: false, error });
      }
    }

    return results;
  }
}
