import { AtpAgent } from '@atproto/api';

export class BlueSkyService {
  private agent: AtpAgent;
  private currentCursor: string | undefined;

  constructor() {
    this.agent = new AtpAgent({ service: 'https://bsky.social' });
    this.currentCursor = undefined;
  }

  async login(identifier: string, password: string) {
    await this.agent.login({ identifier, password });
  }

  async getUserPosts(resetCursor = false) {
    if (resetCursor) {
      this.currentCursor = undefined;
    }

    const response = await this.agent.getAuthorFeed({
      actor: this.agent.session?.did || '',
      cursor: this.currentCursor,
      limit: 30,
    });

    this.currentCursor = response.data.cursor;
    return {
      feed: response.data.feed,
      hasMore: !!response.data.cursor,
    };
  }

  async deletePost(uri: string) {
    console.log('TODO: Delete post', uri);
    // const parts = uri.split('/');
    // const rkey = parts[parts.length - 1];
    // await this.agent.deletePost(rkey);
  }

  async repost(uri: string) {
    console.log('TODO: Repost post', uri);
    // await this.agent.repost(uri);
  }
}
