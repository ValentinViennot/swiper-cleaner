import type { AppBskyEmbedImages, AppBskyEmbedVideo } from '@atproto/api';
import React, { useCallback } from 'react';
import { Image, Text, View } from 'react-native';
import { cardStyles } from '../styles/card.styles';
import type { PostData } from '../types/post';

type CardProps = {
  postData: PostData;
  isRepost: boolean;
};

type MediaEmbed = {
  thumb: string;
  aspectRatio?: { width: number; height: number };
  isVideo?: boolean;
};

const Card = ({ postData, isRepost }: CardProps) => {
  console.log('[MemoizedCard] Rendering card:', { uri: postData.uri, isRepost });

  const renderPostImage = useCallback((media: MediaEmbed, index: number) => {
    return (
      <Image
        key={index}
        source={{ uri: media.thumb }}
        style={[
          cardStyles.postImage,
          {
            aspectRatio: (media.aspectRatio?.width ?? 1) / (media.aspectRatio?.height ?? 1),
          },
        ]}
      />
    );
  }, []);

  const renderPostStats = useCallback(
    (postData: PostData) => (
      <View style={cardStyles.statsContainer}>
        <Text style={cardStyles.statText}>💬 {postData.replyCount}</Text>
        <Text style={cardStyles.statText}>🔁 {postData.repostCount}</Text>
        <Text style={cardStyles.statText}>❤️ {postData.likeCount}</Text>
      </View>
    ),
    [],
  );

  const getEmbeddedMedia = useCallback((embed: unknown): MediaEmbed[] | null => {
    console.log('[Embed] Post embed data:', JSON.stringify(embed, null, 2));

    if (!embed) return null;

    switch ((embed as { $type: string }).$type) {
      case 'app.bsky.embed.images#view':
        return (embed as AppBskyEmbedImages.View).images.map(img => ({
          thumb: img.thumb,
          aspectRatio: img.aspectRatio,
          isVideo: false,
        }));

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

      default:
        return null;
    }
  }, []);

  const embeddedMedia = getEmbeddedMedia(postData.embed);

  return (
    <View style={cardStyles.renderCardContainer}>
      {isRepost && <Text style={[cardStyles.repostIndicator, { opacity: 1 }]}>🔄 Repost</Text>}
      <View style={cardStyles.cardContent}>
        <View style={cardStyles.authorContainer}>
          <Image source={{ uri: postData.author.avatar }} style={cardStyles.avatar} />
          <View style={cardStyles.authorInfo}>
            <Text style={cardStyles.displayName}>{postData.author.displayName}</Text>
            <Text style={cardStyles.handle}>@{postData.author.handle}</Text>
          </View>
        </View>

        <Text style={cardStyles.postText}>{postData.record.text}</Text>

        {embeddedMedia && (
          <View style={cardStyles.imageContainer}>{embeddedMedia.map(renderPostImage)}</View>
        )}

        <View style={cardStyles.postFooter}>
          <Text style={cardStyles.dateText}>
            {new Date(postData.record.createdAt).toLocaleString()}
          </Text>
          {renderPostStats(postData)}
        </View>
      </View>
    </View>
  );
};

export const MemoizedCard = React.memo(Card);

MemoizedCard.displayName = 'MemoizedCard';
