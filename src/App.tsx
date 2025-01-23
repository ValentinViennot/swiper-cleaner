/* eslint-disable react-native/no-inline-styles */
import type { AppBskyEmbedImages, AppBskyFeedPost } from '@atproto/api';
import type { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';
import ActionButton from './components/ActionButton';
import ConfigurationScreen from './components/ConfigurationScreen';
import { BlueSkyService } from './services/bluesky';

import { configureReanimatedLogger } from 'react-native-reanimated';

console.log('[App] Configuring Reanimated logger');
configureReanimatedLogger({
  strict: false,
});

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
const ICON_SIZE = 24;

type PostData = PostView & { record: AppBskyFeedPost.Record };
type TriagedPostsMap = Map<string, string>; // <uri, timestamp>

type MemoizedCardProps = {
  postData: PostData;
  renderPostImage: (img: any, index: number) => React.ReactNode;
  renderPostStats: (postData: PostData) => React.ReactNode;
};

// Configuration
const springConfig = {
  stiffness: 200,
  damping: 15,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

const STORAGE_KEYS = {
  USERNAME: '@bluesky_username',
  APP_PASSWORD: '@bluesky_app_password',
  SHOW_REPOSTS: '@bluesky_show_reposts',
  TRIAGED_PREFIX: '@bluesky_triaged:',
  REVIEW_INTERVAL: '@bluesky_review_interval',
};

// Add this class near the top, after imports
class Mutex {
  private locked = false;
  private queue: (() => void)[] = [];

  async acquire(): Promise<void> {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.locked = false;
    }
  }
}

const App = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [showReposts, setShowReposts] = useState(true);
  const [triagedPosts, setTriagedPosts] = useState<TriagedPostsMap>(new Map());
  const [reviewInterval, setReviewInterval] = useState(30);
  const [credentials, setCredentials] = useState({
    username: '',
    appPassword: '',
  });
  const [showConfig, setShowConfig] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [deletionQueue, setDeletionQueue] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [processedPosts] = useState(new Set<string>());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs
  const ref = useRef<SwiperCardRefType>();
  const bluesky = useRef(new BlueSkyService());
  const swipeMutex = useRef(new Mutex());

  // Storage Helpers
  const loadTriagedPosts = async () => {
    console.log('[Storage] Loading triaged posts from AsyncStorage');
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const triagedKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.TRIAGED_PREFIX));
      console.log(`[Storage] Found ${triagedKeys.length} triaged posts`);

      if (triagedKeys.length > 0) {
        const items = await AsyncStorage.multiGet(triagedKeys);
        const triagedMap = new Map(
          items.map(([key, value]) => [
            key.replace(STORAGE_KEYS.TRIAGED_PREFIX, ''),
            value as string,
          ]),
        );
        setTriagedPosts(triagedMap);
      }

      const interval = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_INTERVAL);
      if (interval) {
        console.log(`[Storage] Setting review interval to ${interval} days`);
        setReviewInterval(Number(interval));
      }
    } catch (error) {
      console.error('[Storage] Error loading triaged posts:', error);
    }
  };

  const addTriagedPost = async (uri: string) => {
    console.log(`[Storage] Adding post to triage: ${uri}`);
    const normalizedUri = uri.toLowerCase();
    const timestamp = new Date().toISOString();

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRIAGED_PREFIX + normalizedUri, timestamp);
      console.log('[Storage] Successfully stored triaged post');

      const updatedPosts = new Map(triagedPosts);
      updatedPosts.set(normalizedUri, timestamp);
      setTriagedPosts(updatedPosts);
    } catch (error) {
      console.error('[Storage] Error adding triaged post:', error);
    }
  };

  const cleanExpiredTriagedPosts = useCallback(async () => {
    if (reviewInterval === 0) {
      console.log('[Cleanup] Review interval is 0, skipping cleanup');
      return;
    }

    console.log('[Cleanup] Starting cleanup of expired triaged posts');
    const now = new Date();
    const updatedPosts = new Map(triagedPosts);
    const keysToDelete: string[] = [];

    for (const [uri, timestamp] of updatedPosts) {
      const triagedDate = new Date(timestamp);
      const daysSinceTriaged = Math.floor(
        (now.getTime() - triagedDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceTriaged >= reviewInterval) {
        console.log(`[Cleanup] Post expired (${daysSinceTriaged} days old): ${uri}`);
        updatedPosts.delete(uri);
        keysToDelete.push(STORAGE_KEYS.TRIAGED_PREFIX + uri);
      }
    }

    if (keysToDelete.length > 0) {
      console.log(`[Cleanup] Removing ${keysToDelete.length} expired posts`);
      try {
        await AsyncStorage.multiRemove(keysToDelete);
        setTriagedPosts(updatedPosts);
        console.log('[Cleanup] Successfully removed expired posts');
      } catch (error) {
        console.error('[Cleanup] Error removing expired posts:', error);
      }
    } else {
      console.log('[Cleanup] No expired posts found');
    }
  }, [triagedPosts, reviewInterval]);

  // Auth Helpers
  const loadCredentials = async () => {
    console.log('[Auth] Loading credentials from storage');
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      const appPassword = await AsyncStorage.getItem(STORAGE_KEYS.APP_PASSWORD);
      const showRepostsStr = await AsyncStorage.getItem(STORAGE_KEYS.SHOW_REPOSTS);

      if (showRepostsStr !== null) {
        console.log(`[Auth] Setting show reposts to ${showRepostsStr}`);
        setShowReposts(showRepostsStr === 'true');
      }

      if (username && appPassword) {
        console.log(`[Auth] Found credentials for user: ${username}`);
        setCredentials({ username, appPassword });
        setShowConfig(false);
      } else {
        console.log('[Auth] No credentials found, showing config screen');
        setShowConfig(true);
      }
    } catch (error) {
      console.error('[Auth] Error loading credentials:', error);
      setShowConfig(true);
    }
  };

  const clearCredentials = async () => {
    console.log('[Auth] Clearing credentials');
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME);
      await AsyncStorage.removeItem(STORAGE_KEYS.APP_PASSWORD);
      setCredentials({ username: '', appPassword: '' });
      setShowConfig(true);
      console.log('[Auth] Credentials cleared successfully');
    } catch (error) {
      console.error('[Auth] Error clearing credentials:', error);
    }
  };

  const handleSaveConfig = async (
    username: string,
    appPassword: string,
    showReposts: boolean,
    reviewInterval: number,
  ) => {
    console.log('[Config] Saving new configuration');
    try {
      if (!username || !appPassword) {
        throw new Error('Username and password are required');
      }

      setIsLoggingIn(true);
      console.log('[Config] Attempting login with new credentials');
      await bluesky.current.login(username, appPassword);
      console.log('[Config] Login successful');

      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
      await AsyncStorage.setItem(STORAGE_KEYS.APP_PASSWORD, appPassword);
      await AsyncStorage.setItem(STORAGE_KEYS.SHOW_REPOSTS, String(showReposts));
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_INTERVAL, String(reviewInterval));
      console.log('[Config] Configuration saved to storage');

      setIsInitialized(false);
      setCredentials({ username, appPassword });
      setShowReposts(showReposts);
      setReviewInterval(reviewInterval);
      setShowConfig(false);
      loadPosts();
    } catch (error) {
      console.error('[Config] Login failed:', error);
      Alert.alert('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Post Loading
  const loadPosts = useCallback(async () => {
    console.log('[Posts] Starting to load posts');
    if (!credentials.username || !credentials.appPassword || showConfig || isLoggingIn) {
      console.log('[Posts] Skipping post load - missing credentials or showing config');
      return;
    }

    setIsLoadingPosts(true);
    setIsComplete(false);
    console.log('[Posts] Starting to load posts');
    try {
      console.log('[Posts] Attempting login');
      await bluesky.current.login(credentials.username, credentials.appPassword);
      console.log('[Posts] Login successful');

      console.log('[Posts] Fetching user posts');
      const userPostsResponse = await bluesky.current.getUserPosts();
      console.log(`[Posts] Received ${userPostsResponse.length} raw posts`);

      // Get all triaged URIs in lowercase for comparison
      const triagedUris = Array.from(triagedPosts.keys()).map(uri => uri.toLowerCase());
      console.log(`[Posts] Found ${triagedUris.length} triaged posts to filter out`);

      const filteredPosts = userPostsResponse.filter(post => {
        const postUri = post.post.uri.toLowerCase();
        // Check both triaged and processed posts
        const isTriaged = triagedUris.includes(postUri);
        const isProcessed = processedPosts.has(postUri);

        if (isTriaged || isProcessed) {
          console.log('[Posts] Filtering out triaged/processed post:', postUri);
          return false;
        }
        if (!showReposts && post.reason?.$type === 'app.bsky.feed.defs#reasonRepost') {
          console.log('[Posts] Filtering out repost:', postUri);
          return false;
        }
        const type = (post.post.record as { $type: string }).$type;
        return type === 'app.bsky.feed.post';
      });

      const formattedPosts = filteredPosts.map(post => ({
        ...post.post,
        record: post.post.record as AppBskyFeedPost.Record,
      }));

      console.log(`[Posts] Loaded ${formattedPosts.length} posts into state`);
      if (formattedPosts.length === 0) {
        console.log('[Posts] No posts remaining after filtering, marking as complete');
        setIsComplete(true);
      } else {
        setPosts(formattedPosts);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('[Posts] Error loading posts:', error);
      await clearCredentials();
    } finally {
      setIsLoadingPosts(false);
    }
  }, [
    credentials.username,
    credentials.appPassword,
    showConfig,
    isLoggingIn,
    showReposts,
    triagedPosts,
    posts.length,
    processedPosts,
  ]);

  // Rendering Helpers
  const renderPostImage = useCallback(
    (img: any, index: number) => (
      <Image
        key={index}
        source={{ uri: img.thumb }}
        style={[
          styles.postImage,
          {
            aspectRatio: (img.aspectRatio?.width ?? 1) / (img.aspectRatio?.height ?? 1),
          },
        ]}
      />
    ),
    [],
  );

  const renderPostStats = useCallback(
    (postData: PostData) => (
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>💬 {postData.replyCount}</Text>
        <Text style={styles.statText}>🔁 {postData.repostCount}</Text>
        <Text style={(postData.likeCount ?? 0 > 0) ? styles.statText : styles.hiddenStatText}>
          ❤️ {postData.likeCount}
        </Text>
      </View>
    ),
    [],
  );

  // Add this new memoized component
  const MemoizedCard = React.memo(
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

  // Update the renderCard function
  const renderCard = useCallback(
    (postData: PostData) => (
      <MemoizedCard
        postData={postData}
        renderPostImage={renderPostImage}
        renderPostStats={renderPostStats}
      />
    ),
    [renderPostImage, renderPostStats],
  );

  // Overlay Labels
  const createOverlayLabel = useCallback(
    (text: string, color: string) => () => (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: color,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <Text style={styles.overlayText}>{text}</Text>
      </View>
    ),
    [],
  );

  const OverlayLabelRight = createOverlayLabel('KEEP', 'green');
  const OverlayLabelLeft = createOverlayLabel('DELETE', 'red');
  const OverlayLabelTop = createOverlayLabel('REPOST', 'blue');
  const OverlayLabelBottom = createOverlayLabel('SNOOZE', 'orange');

  const handleSwipe = useCallback(
    async (direction: string, cardIndex: number) => {
      console.log(`[Swipe] Handling swipe ${direction} for card ${cardIndex}`, {
        postsLength: posts.length,
        post: posts[cardIndex],
      });

      if (!posts.length) {
        console.log('[Swipe] No posts available');
        return;
      }

      await swipeMutex.current.acquire();

      try {
        const post = posts[cardIndex];
        if (!post) {
          console.log('[Swipe] Invalid card index:', cardIndex);
          throw new Error('Invalid card index');
        }

        const postUri = post.uri;
        if (!postUri) {
          console.log('[Swipe] Post has no URI:', post);
          throw new Error('Invalid post URI (no URI)');
        }

        switch (direction) {
          case 'left':
            console.log('[Swipe] Adding post to deletion queue:', postUri);
            setDeletionQueue(prev => [...prev, postUri]);
            break;
          case 'right':
            console.log('[Swipe] Adding post to triage (keep):', postUri);
            await addTriagedPost(postUri);
            break;
          case 'up':
            console.log('[Swipe] Reposting and triaging:', postUri);
            await bluesky.current.repost(postUri);
            await addTriagedPost(postUri);
            break;
          case 'down':
            console.log('[Swipe] Snoozing post:', postUri);
            await addTriagedPost(postUri);
            break;
        }
        processedPosts.add(postUri.toLowerCase());
      } finally {
        swipeMutex.current.release();
      }
    },
    [posts, addTriagedPost, processedPosts],
  );

  // Add this helper function to remove a post from triaged storage
  const removeFromTriaged = async (uri: string) => {
    console.log(`[Storage] Removing post from triage: ${uri}`);
    const normalizedUri = uri.toLowerCase();

    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TRIAGED_PREFIX + normalizedUri);
      const updatedPosts = new Map(triagedPosts);
      updatedPosts.delete(normalizedUri);
      setTriagedPosts(updatedPosts);
      processedPosts.delete(normalizedUri);
      console.log('[Storage] Successfully removed post from triage');
    } catch (error) {
      console.error('[Storage] Error removing post from triage:', error);
    }
  };

  const rewindToPreviousPost = useCallback(async () => {
    if (currentIndex > 0) {
      const rewindedPost = posts[currentIndex - 1];
      if (rewindedPost?.uri) {
        console.log('[Button] Removing post from queues:', rewindedPost.uri);
        // Remove from deletion queue if present
        setDeletionQueue(prev => prev.filter(uri => uri !== rewindedPost.uri));
        // Remove from triaged posts if present
        await removeFromTriaged(rewindedPost.uri);
      }
      ref.current?.swipeBack();
    }
  }, [currentIndex, posts]);

  // Update handleButtonPress to handle reload/rewind properly
  const handleButtonPress = useCallback(
    (action: string) => {
      console.log(`[Button] ${action} button pressed`);
      switch (action) {
        case 'reload':
          rewindToPreviousPost();
          break;
        case 'delete':
          ref.current?.swipeLeft();
          break;
        case 'snooze':
          ref.current?.swipeBottom();
          break;
        case 'keep':
          ref.current?.swipeTop();
          break;
        case 'like':
          ref.current?.swipeRight();
          break;
      }
    },
    [posts, removeFromTriaged, currentIndex],
  );

  const processDeletionQueue = useCallback(async () => {
    console.log(`[Delete] Processing deletion queue of ${deletionQueue.length} posts`);
    try {
      for (const uri of deletionQueue) {
        console.log('[Delete] Deleting post:', uri);
        await bluesky.current.deletePost(uri);
        await addTriagedPost(uri);
      }
      console.log('[Delete] Successfully processed deletion queue');
      setDeletionQueue([]);
    } catch (error) {
      console.error('[Delete] Error processing deletion queue:', error);
      Alert.alert('Error', 'Failed to delete some posts. Please try again.');
    }
  }, [deletionQueue]);

  // Update handleReset to properly clear all state
  const handleReset = useCallback(async () => {
    console.log('[Reset] Starting reset process');
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const triagedKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.TRIAGED_PREFIX));
      await AsyncStorage.multiRemove(triagedKeys);

      // Clear all relevant state
      setTriagedPosts(new Map());
      processedPosts.clear();
      setPosts([]);
      setDeletionQueue([]);
      setIsComplete(false);
      setIsInitialized(false);
      setShowConfig(false);

      console.log('[Reset] Successfully reset all post data');
    } catch (error) {
      console.error('[Reset] Error resetting triaged posts:', error);
      Alert.alert('Error', 'Failed to reset triaged posts. Please try again.');
    }
  }, [processedPosts]); // Add processedPosts to dependencies

  // Effects
  useEffect(() => {
    console.log('[Effect] Loading initial credentials');
    loadCredentials();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      console.log('[Effect] Initial posts load');
      loadPosts();
    }
  }, [isInitialized, loadPosts]);

  useEffect(() => {
    console.log('[Effect] Loading triaged posts');
    loadTriagedPosts();
  }, []);

  useEffect(() => {
    console.log('[Effect] Cleaning expired triaged posts');
    cleanExpiredTriagedPosts();
  }, [cleanExpiredTriagedPosts]);

  // Add initialization logging to a useEffect that only runs once
  useEffect(() => {
    console.log('[App] Component mounted');
  }, []);

  // Render
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        {credentials.username && !showConfig ? (
          <TouchableOpacity style={styles.userInfo} onPress={() => setShowConfig(true)}>
            <Text style={styles.userInfoText}>@{credentials.username}</Text>
            <AntDesign name="setting" size={16} color="#999" style={styles.settingsIcon} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoadingPosts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : isComplete ? (
        <View style={styles.completeContainer}>
          <Text style={styles.completeText}>All done! 🎉</Text>
          <Text style={styles.completeSubtext}>
            {reviewInterval > 0
              ? `Come back in ${reviewInterval} days to review more posts`
              : 'No more posts to review'}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadPosts}>
            <Text style={styles.refreshButtonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.subContainer}>
            <Swiper
              ref={ref}
              cardStyle={styles.cardStyle}
              data={posts}
              renderCard={renderCard}
              onIndexChange={index => {
                console.log('[Swiper] Current Active index:', index);
                setCurrentIndex(index);
              }}
              onSwipeLeft={cardIndex => handleSwipe('left', cardIndex)}
              onSwipeRight={cardIndex => handleSwipe('right', cardIndex)}
              onSwipeTop={cardIndex => handleSwipe('up', cardIndex)}
              onSwipeBottom={cardIndex => handleSwipe('down', cardIndex)}
              onSwipedAll={() => {
                console.log('[Swiper] Reached end of stack, loading more posts');
                swipeMutex.current.acquire().then(() => {
                  setIsInitialized(false);
                  loadPosts()
                    .then(() => {
                      console.log('[Swiper] Posts loaded after reaching end');
                    })
                    .finally(() => {
                      swipeMutex.current.release();
                    });
                });
              }}
              OverlayLabelRight={OverlayLabelRight}
              OverlayLabelLeft={OverlayLabelLeft}
              OverlayLabelTop={OverlayLabelTop}
              OverlayLabelBottom={OverlayLabelBottom}
              swipeRightSpringConfig={springConfig}
              swipeLeftSpringConfig={springConfig}
              swipeTopSpringConfig={springConfig}
              swipeBottomSpringConfig={springConfig}
              inputOverlayLabelRightOpacityRange={[0, windowWidth / 2]}
              outputOverlayLabelRightOpacityRange={[0, 1]}
              inputOverlayLabelLeftOpacityRange={[0, -(windowWidth / 2)]}
              outputOverlayLabelLeftOpacityRange={[0, 1]}
              inputOverlayLabelTopOpacityRange={[0, -(windowHeight / 2)]}
              outputOverlayLabelTopOpacityRange={[0, 1]}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <ActionButton style={styles.button} onTap={() => handleButtonPress('reload')}>
              <AntDesign name="reload1" size={ICON_SIZE} color="white" />
            </ActionButton>
            <ActionButton style={styles.button} onTap={() => handleButtonPress('delete')}>
              <AntDesign name="close" size={ICON_SIZE} color="white" />
            </ActionButton>
            <ActionButton style={styles.button} onTap={() => handleButtonPress('snooze')}>
              <AntDesign name="arrowdown" size={ICON_SIZE} color="white" />
            </ActionButton>
            <ActionButton style={styles.button} onTap={() => handleButtonPress('keep')}>
              <AntDesign name="arrowup" size={ICON_SIZE} color="white" />
            </ActionButton>
            <ActionButton style={styles.button} onTap={() => handleButtonPress('like')}>
              <AntDesign name="heart" size={ICON_SIZE} color="white" />
            </ActionButton>
          </View>
        </>
      )}

      {showConfig && (
        <ConfigurationScreen
          username={credentials.username}
          appPassword={credentials.appPassword}
          showReposts={showReposts}
          reviewInterval={reviewInterval}
          onSave={handleSaveConfig}
          onLogout={clearCredentials}
          onCancel={() => setShowConfig(false)}
          isLoading={isLoggingIn}
          isLoggedIn={!!credentials.username}
          onReset={handleReset}
        />
      )}

      {deletionQueue.length > 0 && (
        <TouchableOpacity style={styles.confirmButton} onPress={processDeletionQueue}>
          <Text style={styles.confirmButtonText}>Delete ({deletionQueue.length})</Text>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    bottom: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  button: {
    height: 50,
    borderRadius: 40,
    aspectRatio: 1,
    backgroundColor: '#3A3D45',
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardStyle: {
    width: '95%',
    height: '75%',
    borderRadius: 15,
    marginVertical: 20,
  },
  renderCardContainer: {
    flex: 1,
    borderRadius: 15,
    height: '75%',
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorInfo: {
    marginLeft: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  handle: {
    fontSize: 14,
    color: '#666',
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2C2C2C',
    marginBottom: 12,
  },
  imageContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: undefined,
    borderRadius: 8,
  },
  postFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  hiddenStatText: {
    fontSize: 14,
    color: 'transparent',
  },
  subContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayLabelContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  userInfoText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  settingsIcon: {
    marginLeft: 6,
  },
  overlayText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  confirmButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  completeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
