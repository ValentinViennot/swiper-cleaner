import type { AppBskyEmbedImages } from '@atproto/api';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from '../styles/app.styles';
import type { PostData } from '../types/post';

interface CardProps {
  postData: PostData;
  renderPostImage: (img: unknown, index: number) => React.ReactNode;
  renderPostStats: (postData: PostData) => React.ReactNode;
  isRepost: boolean;
}

const Card = ({ postData, renderPostImage, renderPostStats, isRepost }: CardProps) => {
  console.log('[MemoizedCard] Rendering card:', { uri: postData.uri, isRepost });

  return (
    <View style={styles.renderCardContainer}>
      {isRepost && <Text style={[styles.repostIndicator, { opacity: 1 }]}>🔄 Repost</Text>}
      <View style={styles.cardContent}>
        <View style={styles.authorContainer}>
          <Image source={{ uri: postData.author.avatar }} style={styles.avatar} />
          <View style={styles.authorInfo}>
            <Text style={styles.displayName}>{postData.author.displayName}</Text>
            <Text style={styles.handle}>@{postData.author.handle}</Text>
          </View>
        </View>

        <Text style={styles.postText}>{postData.record.text}</Text>

        {postData.embed?.$type === 'app.bsky.embed.images#view' && (
          <View style={styles.imageContainer}>
            {(postData.embed as AppBskyEmbedImages.View).images.map(renderPostImage)}
          </View>
        )}

        <View style={styles.postFooter}>
          <Text style={styles.dateText}>
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
