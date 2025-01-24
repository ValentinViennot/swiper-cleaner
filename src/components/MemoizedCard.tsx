/* eslint-disable no-console */
import type { AppBskyEmbedImages, AppBskyEmbedVideo } from '@atproto/api';
import React, { useCallback } from 'react';
import { Image, Text, View, Linking, TouchableOpacity } from 'react-native';
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

  const openInBlueSky = useCallback(
    (uri: string) => {
      const bskyAppUrl = `https://bsky.app/profile/${postData.author.handle}/post/${uri.split('/').pop()}`;
      Linking.openURL(bskyAppUrl);
    },
    [postData.author.handle],
  );

  const renderQuotedPost = useCallback(
    (embed: any) => {
      if (embed?.$type !== 'app.bsky.embed.record#view' || !embed?.record) return null;
      const quotedPost = embed.record;

      return (
        <View style={cardStyles.quoteContainer}>
          <View style={cardStyles.quoteAuthorContainer}>
            <Image
              source={{ uri: quotedPost.author.avatar }}
              style={cardStyles.quoteAuthorAvatar}
            />
            <View style={cardStyles.quoteAuthorInfo}>
              <Text style={cardStyles.quoteDisplayName}>{quotedPost.author.displayName}</Text>
              <Text style={cardStyles.quoteHandle}>@{quotedPost.author.handle}</Text>
            </View>
          </View>
          <Text style={cardStyles.quoteText}>{quotedPost.value.text}</Text>
          {quotedPost.embeds?.[0]?.$type === 'app.bsky.embed.images#view' && (
            <View style={cardStyles.imageContainer}>
              {quotedPost.embeds[0].images.map((img: any, index: number) =>
                renderPostImage(
                  {
                    thumb: img.thumb,
                    aspectRatio: img.aspectRatio,
                    isVideo: false,
                  },
                  index,
                ),
              )}
            </View>
          )}
          {quotedPost.embeds?.[0]?.$type === 'app.bsky.embed.video#view' && (
            <View style={cardStyles.imageContainer}>
              {renderPostImage(
                {
                  thumb: quotedPost.embeds[0].thumbnail,
                  aspectRatio: quotedPost.embeds[0].aspectRatio,
                  isVideo: true,
                },
                0,
              )}
            </View>
          )}
        </View>
      );
    },
    [renderPostImage],
  );

  return (
    <View style={cardStyles.renderCardContainer}>
      {isRepost && <Text style={cardStyles.repostIndicator}>🔄 Repost</Text>}
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

        {postData.embed?.$type === 'app.bsky.embed.record#view' && renderQuotedPost(postData.embed)}

        <View style={cardStyles.postFooter}>
          <TouchableOpacity onPress={() => openInBlueSky(postData.uri)}>
            <Text style={[cardStyles.dateText, cardStyles.linkText]}>
              {new Date(postData.record.createdAt).toLocaleString(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
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
