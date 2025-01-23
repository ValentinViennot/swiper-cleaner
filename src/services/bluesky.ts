import { AtpAgent } from '@atproto/api';

export class BlueSkyService {
    private agent: AtpAgent;

    constructor() {
        this.agent = new AtpAgent({ service: 'https://bsky.social' });
    }

    async login(identifier: string, password: string) {
        await this.agent.login({ identifier, password });
    }

    async getUserPosts() {
        const response = await this.agent.getAuthorFeed({
            actor: this.agent.session?.did || '',
        });
        // TODO: Handle pagination
        return response.data.feed;
    }

    async deletePost(uri: string) {
        console.log("TODO: Delete post", uri);
        // const parts = uri.split('/');
        // const rkey = parts[parts.length - 1];
        // await this.agent.deletePost(rkey);
    }

    async repost(uri: string) {
        console.log("TODO: Repost post", uri);
        // await this.agent.repost(uri);
    }
} 