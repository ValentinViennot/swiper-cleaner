import { AtpAgent } from '@atproto/api';

export class BlueSkyService {
  private agent: AtpAgent;
  private currentCursor: string | undefined;

  constructor() {
    console.log('[BlueSky] Initializing service');
    this.agent = new AtpAgent({ service: 'https://bsky.social' });
    this.currentCursor = undefined;
  }

  async login(identifier: string, password: string) {
    console.log('[BlueSky] Attempting login for:', identifier);
    await this.agent.login({ identifier, password });
    console.log('[BlueSky] Login successful');
  }

  async getUserPosts(resetCursor = false) {
    console.log('[BlueSky] Getting user posts, resetCursor:', resetCursor);
    if (resetCursor) {
      console.log('[BlueSky] Resetting cursor');
      this.currentCursor = undefined;
    }

    const did = this.agent.session?.did || '';
    console.log('[BlueSky] Fetching posts for DID:', did, 'with cursor:', this.currentCursor);

    const response = await this.agent.getAuthorFeed({
      actor: did,
      cursor: this.currentCursor,
      limit: 30,
    });

    this.currentCursor = response.data.cursor;
    console.log(
      '[BlueSky] Got response with',
      response.data.feed.length,
      'posts, new cursor:',
      this.currentCursor,
    );

    return {
      feed: response.data.feed,
      hasMore: !!response.data.cursor,
    };
  }

  async deletePost(uri: string) {
    console.log('[BlueSky] Attempting to delete post:', uri);
    // const parts = uri.split('/');
    // const rkey = parts[parts.length - 1];
    // await this.agent.deletePost(rkey);
    console.log('[BlueSky] Delete functionality not yet implemented');
  }

  async repost(uri: string) {
    console.log('[BlueSky] Attempting to repost:', uri);
    // await this.agent.repost(uri);
    console.log('[BlueSky] Repost functionality not yet implemented');
  }
}
