import type {
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedPost,
} from '@atproto/api';
import type { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import type { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import React, { useCallback } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { cardStyles } from '../styles/card.styles';
import type { PostData } from '../types/post';

interface CardProps {
  postData: PostData;
  isRepost: boolean;
}

interface MediaEmbed {
  thumb: string;
  aspectRatio?: { width: number; height: number };
  isVideo?: boolean;
}

const DEFAULT_AUTHOR = {
  displayName: 'Unknown User',
  handle: 'unknown',
  avatar: 'https://bsky.social/static/default-avatar.png',
};

const Card: React.FC<CardProps> = ({ postData, isRepost }) => {
  console.debug('[MemoizedCard] Rendering card:', { uri: postData.uri, isRepost });

  const renderPostImage = useCallback((media: MediaEmbed, index: number) => {
    if (!media?.thumb) {
      console.warn('[MemoizedCard] Missing media thumb:', media);
      return null;
    }

    return (
      <Image
        key={index}
        source={{ uri: media.thumb }}
        style={cardStyles.postImage}
        resizeMode="cover"
      />
    );
  }, []);

  const renderPostStats = useCallback(
    (post: PostData) => (
      <View style={cardStyles.statsContainer}>
        <Text style={cardStyles.statText}>💬 {post.replyCount}</Text>
        <Text style={cardStyles.statText}>🔁 {post.repostCount}</Text>
        <Text style={cardStyles.statText}>❤️ {post.likeCount}</Text>
      </View>
    ),
    [],
  );

  const getEmbeddedMedia = useCallback((embed: unknown): MediaEmbed[] | null => {
    if (!embed) return null;

    const embedType = (embed as { $type: string }).$type;

    switch (embedType) {
      case 'app.bsky.embed.images#view': {
        const imageEmbed = embed as AppBskyEmbedImages.View;
        return imageEmbed.images.map(img => ({
          thumb: img.thumb,
          aspectRatio: img.aspectRatio,
          isVideo: false,
        }));
      }

      case 'app.bsky.embed.video#view': {
        const videoEmbed = embed as AppBskyEmbedVideo.View;
        return [
          {
            thumb: videoEmbed.thumbnail ?? '',
            aspectRatio: videoEmbed.aspectRatio,
            isVideo: true,
          },
        ];
      }

      case 'app.bsky.embed.recordWithMedia#view': {
        const recordWithMedia = embed as AppBskyEmbedRecordWithMedia.View;
        if (recordWithMedia.media.$type === 'app.bsky.embed.images#view') {
          return (recordWithMedia.media as AppBskyEmbedImages.View).images.map(img => ({
            thumb: img.thumb,
            aspectRatio: img.aspectRatio,
            isVideo: false,
          }));
        }
        return null;
      }

      default:
        return null;
    }
  }, []);

  const openInBlueSky = useCallback(
    (uri: string) => {
      const postId = uri.split('/').pop();
      const bskyAppUrl = `https://bsky.app/profile/${postData.author.handle}/post/${postId}`;
      Linking.openURL(bskyAppUrl);
    },
    [postData.author.handle],
  );

  const renderAuthorInfo = useCallback(
    (author: ProfileViewBasic) => (
      <View style={cardStyles.quoteAuthorContainer}>
        <Image source={{ uri: author.avatar }} style={cardStyles.quoteAuthorAvatar} />
        <View style={cardStyles.quoteAuthorInfo}>
          <Text style={cardStyles.quoteDisplayName} numberOfLines={1} ellipsizeMode="tail">
            {author.displayName || ''}
          </Text>
          <Text style={cardStyles.quoteHandle} numberOfLines={1} ellipsizeMode="tail">
            @{author.handle || 'unknown'}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  const renderMediaWithCounter = useCallback(
    (media: MediaEmbed[], index: number) => {
      if (!media[0]) return null;
      return (
        <View style={cardStyles.imageContainer}>
          {renderPostImage(media[0], index)}
          {media.length > 1 && (
            <View style={cardStyles.mediaCounter}>
              <Text style={cardStyles.mediaCounterText}>+{media.length - 1}</Text>
            </View>
          )}
        </View>
      );
    },
    [renderPostImage],
  );

  const renderQuotedPost = useCallback(
    (embed: AppBskyEmbedRecordWithMedia.View) => {
      if (embed?.$type !== 'app.bsky.embed.record#view' || !embed?.record) return null;

      const quotedPost = embed.record as unknown as AppBskyEmbedRecord.ViewRecord;
      if (!quotedPost?.author || !quotedPost?.value) {
        console.warn('[MemoizedCard] Invalid quoted post:', quotedPost);
        return null;
      }

      const quotedAuthor = quotedPost.author as ProfileViewBasic;
      const quotedPostText = (quotedPost.value as AppBskyFeedPost.Record).text;

      const media = [];
      const quotedImages =
        quotedPost.embeds?.[0]?.$type === 'app.bsky.embed.images#view'
          ? ((quotedPost.embeds[0] as AppBskyEmbedImages.View)?.images ?? [])
          : [];

      media.push(
        ...quotedImages.map(img => ({
          thumb: img.thumb,
          aspectRatio: img.aspectRatio,
          isVideo: false,
        })),
      );

      const quotedVideo =
        quotedPost.embeds?.[0]?.$type === 'app.bsky.embed.video#view'
          ? (quotedPost.embeds[0] as AppBskyEmbedVideo.View)
          : undefined;

      if (quotedVideo) {
        media.push({
          thumb: quotedVideo.thumbnail ?? '',
          aspectRatio: quotedVideo.aspectRatio,
          isVideo: true,
        });
      }

      return (
        <View style={cardStyles.quoteContainer}>
          {renderAuthorInfo(quotedAuthor)}
          <Text style={cardStyles.quoteText}>{quotedPostText}</Text>
          {media.length > 0 && renderMediaWithCounter(media, 0)}
        </View>
      );
    },
    [renderAuthorInfo, renderMediaWithCounter],
  );

  const renderParentPosts = useCallback(
    ({ parent, root }: { parent?: PostView; root?: PostView }): React.ReactNode => {
      if (!parent?.record) {
        console.warn('[MemoizedCard] Invalid parent post:', parent);
        return null;
      }

      const parentMedia = getEmbeddedMedia(parent.embed);
      const rootMedia = getEmbeddedMedia(root?.embed);

      // console.debug(
      //   '[MemoizedCard] Rendering parent posts:',
      //   JSON.stringify({ parentMedia, rootMedia }),
      // );

      return (
        <View style={cardStyles.quoteContainer}>
          {renderAuthorInfo(parent.author)}
          <Text style={cardStyles.quoteText}>{(parent.record as AppBskyFeedPost.Record).text}</Text>
          {parentMedia && parentMedia.length > 0 && renderMediaWithCounter(parentMedia, 0)}

          {root && (
            <View style={cardStyles.quoteContainer}>
              {renderAuthorInfo(root.author)}
              <Text style={cardStyles.quoteText}>
                {(root.record as AppBskyFeedPost.Record).text}
              </Text>
              {rootMedia && rootMedia.length > 0 && renderMediaWithCounter(rootMedia, 0)}
            </View>
          )}
        </View>
      );
    },
    [getEmbeddedMedia, renderAuthorInfo, renderMediaWithCounter],
  );

  if (!postData?.record) {
    console.warn('[MemoizedCard] Invalid post data:', postData);
    return null;
  }

  const author = postData.author || DEFAULT_AUTHOR;
  const embeddedMedia = getEmbeddedMedia(postData.embed);
  const dateOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  } as const;

  return (
    <View style={cardStyles.renderCardContainer}>
      {isRepost && <Text style={cardStyles.repostIndicator}>🔄 Repost</Text>}
      <View style={cardStyles.cardContent}>
        <View style={cardStyles.scrollableContent}>
          <View style={cardStyles.authorContainer}>
            <Image source={{ uri: author.avatar }} style={cardStyles.avatar} />
            <View style={cardStyles.authorInfo}>
              {author.displayName && (
                <Text style={cardStyles.displayName} numberOfLines={1} ellipsizeMode="tail">
                  {author.displayName}
                </Text>
              )}
              <Text style={cardStyles.handle} numberOfLines={1} ellipsizeMode="tail">
                @{author.handle}
              </Text>
            </View>
          </View>

          <Text style={cardStyles.postText}>{postData.record.text}</Text>

          {embeddedMedia && embeddedMedia.length > 0 && renderMediaWithCounter(embeddedMedia, 0)}

          {(postData.embed?.$type === 'app.bsky.embed.record#view' &&
            renderQuotedPost(postData.embed as AppBskyEmbedRecordWithMedia.View)) ||
            (postData.reply && renderParentPosts(postData.reply))}
        </View>

        <View style={cardStyles.postFooter}>
          <TouchableOpacity onPress={() => openInBlueSky(postData.uri)}>
            <Text style={[cardStyles.dateText, cardStyles.linkText]}>
              {new Date(postData.record.createdAt).toLocaleString(undefined, dateOptions)}
            </Text>
          </TouchableOpacity>
          {renderPostStats(postData)}
        </View>
      </View>
    </View>
  );
};

export const MemoizedCard = React.memo(Card);

MemoizedCard.displayName = 'MemoizedCard';
