import type { AppBskyEmbedImages } from '@atproto/api';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from '../styles/app.styles';
import type { MemoizedCardProps } from '../types/post';

export const MemoizedCard = React.memo(
  ({ postData, renderPostImage, renderPostStats }: MemoizedCardProps) => {
    return (
      <View style={styles.renderCardContainer}>
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
  },
);

MemoizedCard.displayName = 'MemoizedCard';
