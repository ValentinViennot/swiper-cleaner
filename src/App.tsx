import type { AppBskyFeedPost } from '@atproto/api';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';

import ActionButton from './components/ActionButton';
import ConfigurationScreen from './components/ConfigurationScreen';
import { MemoizedCard } from './components/MemoizedCard';
import { SPRING_CONFIG, STORAGE_KEYS } from './constants/storage';
import { BlueSkyService } from './services/bluesky';
import { styles, windowHeight, windowWidth } from './styles/app.styles';
import type { PostData, TriagedPostsMap } from './types/post';
import { Mutex } from './utils/Mutex';

console.log('[App] Configuring Reanimated logger');
configureReanimatedLogger({
  strict: false,
});

const ICON_SIZE = 24;
const blueskyService = new BlueSkyService();

type PostImage = {
  thumb: string;
  aspectRatio?: { width: number; height: number };
};

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
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  // Refs
  const ref = useRef<SwiperCardRefType>();
  const isLoading = useRef(false);
  const swipeMutex = useRef(new Mutex());
  const initializationComplete = useRef(false);

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
      await blueskyService.login(username, appPassword);
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
  const loadPosts = useCallback(
    async (resetCursor = false) => {
      if (isLoading.current) {
        console.log('[Posts] Already loading posts, skipping');
        return false;
      }

      console.log('[Posts] Starting to load posts');
      if (!credentials.username || !credentials.appPassword || showConfig || isLoggingIn) {
        console.log('[Posts] Skipping post load - missing credentials or showing config');
        return false;
      }

      isLoading.current = true;
      setIsLoadingPosts(true);

      try {
        await blueskyService.login(credentials.username, credentials.appPassword);
        const { feed: userPostsResponse, hasMore } = await blueskyService.getUserPosts(resetCursor);
        console.log(`[Posts] Received ${userPostsResponse.length} raw posts, hasMore: ${hasMore}`);
        setHasMorePosts(hasMore);

        const triagedUris = Array.from(triagedPosts.keys()).map(uri => uri.toLowerCase());
        const filteredPosts = userPostsResponse.filter(post => {
          const postUri = post.post.uri.toLowerCase();
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
        setIsInitialized(true);

        if (formattedPosts.length === 0 && !hasMore) {
          console.log('[Posts] No posts remaining and no more to load, marking as complete');
          setIsComplete(true);
          return false;
        } else {
          setPosts(prev => (resetCursor ? formattedPosts : [...prev, ...formattedPosts]));
          return true;
        }
      } catch (error) {
        console.error('[Posts] Error loading posts:', error);
        await clearCredentials();
        return false;
      } finally {
        isLoading.current = false;
        setIsLoadingPosts(false);
      }
    },
    [
      credentials.username,
      credentials.appPassword,
      showConfig,
      isLoggingIn,
      showReposts,
      triagedPosts,
      processedPosts,
      clearCredentials,
    ],
  );

  const renderPostImage = useCallback((img: unknown, index: number) => {
    const image = img as PostImage;
    return (
      <Image
        key={index}
        source={{ uri: image.thumb }}
        style={[
          styles.postImage,
          {
            aspectRatio: (image.aspectRatio?.width ?? 1) / (image.aspectRatio?.height ?? 1),
          },
        ]}
      />
    );
  }, []);

  const renderPostStats = useCallback(
    (postData: PostData) => (
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>💬 {postData.replyCount}</Text>
        <Text style={styles.statText}>🔁 {postData.repostCount}</Text>
        <Text style={styles.statText}>❤️ {postData.likeCount}</Text>
      </View>
    ),
    [],
  );

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
  const createOverlayLabel = useCallback((text: string, color: string) => {
    const OverlayLabel = () => (
      <View
        style={[
          styles.overlayLabelContainer,
          styles.overlayLabelAlignment,
          { backgroundColor: color },
        ]}>
        <Text style={styles.overlayText}>{text}</Text>
      </View>
    );
    OverlayLabel.displayName = `OverlayLabel${text}`;
    return OverlayLabel;
  }, []);

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
      let postUri = '';

      try {
        const post = posts[cardIndex];
        if (!post) {
          console.log('[Swipe] Invalid card index:', cardIndex);
          throw new Error('Invalid card index');
        }

        postUri = post.uri.toLowerCase();
        if (!postUri) {
          console.log('[Swipe] Post has no URI:', post);
          throw new Error('Invalid post URI (no URI)');
        }

        if (processedPosts.has(postUri)) {
          console.log('[Swipe] Post already processed, skipping:', postUri);
          return;
        }

        processedPosts.add(postUri);

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
            await blueskyService.repost(postUri);
            await addTriagedPost(postUri);
            break;
          case 'down':
            console.log('[Swipe] Snoozing post:', postUri);
            await addTriagedPost(postUri);
            break;
        }
      } catch (error) {
        console.error('[Swipe] Error processing swipe:', error);
        if (postUri) {
          processedPosts.delete(postUri);
        }
      } finally {
        swipeMutex.current.release();
      }
    },
    [posts, addTriagedPost, processedPosts],
  );

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
        setDeletionQueue(prev => prev.filter(uri => uri !== rewindedPost.uri));
        await removeFromTriaged(rewindedPost.uri);
      }
      ref.current?.swipeBack();
    }
  }, [currentIndex, posts]);

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
    [rewindToPreviousPost],
  );

  const processDeletionQueue = useCallback(async () => {
    console.log(`[Delete] Processing deletion queue of ${deletionQueue.length} posts`);
    try {
      for (const uri of deletionQueue) {
        console.log('[Delete] Deleting post:', uri);
        await blueskyService.deletePost(uri);
        await addTriagedPost(uri);
      }
      console.log('[Delete] Successfully processed deletion queue');
      setDeletionQueue([]);
    } catch (error) {
      console.error('[Delete] Error processing deletion queue:', error);
      Alert.alert('Error', 'Failed to delete some posts. Please try again.');
    }
  }, [deletionQueue, addTriagedPost]);

  const handleReset = useCallback(async () => {
    console.log('[Reset] Starting reset process');
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const triagedKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.TRIAGED_PREFIX));
      console.log(`[Reset] Found ${triagedKeys.length} triaged keys to remove`);
      await AsyncStorage.multiRemove(triagedKeys);

      console.log('[Reset] Clearing application state');
      setTriagedPosts(new Map());
      processedPosts.clear();
      setPosts([]);
      setDeletionQueue([]);
      setCurrentIndex(0);
      setHasMorePosts(true);
      setIsComplete(false);
      setIsInitialized(false);
      setShowConfig(false);

      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('[Reset] Loading fresh posts');
      const result = await loadPosts(true);
      console.log('[Reset] Load posts result:', { result, hasMorePosts, posts: posts.length });
    } catch (error) {
      console.error('[Reset] Error resetting triaged posts:', error);
      Alert.alert('Error', 'Failed to reset triaged posts. Please try again.');
    }
  }, [loadPosts, posts.length, hasMorePosts]);

  const handleSwipedAll = useCallback(async () => {
    console.log('[Swiper] Reached end of stack, checking for more posts');
    if (!hasMorePosts) {
      console.log('[Swiper] No more posts available');
      setIsComplete(true);
      return;
    }

    await swipeMutex.current.acquire();
    try {
      await loadPosts(false);
      console.log('[Swiper] Additional posts loaded');
    } finally {
      swipeMutex.current.release();
    }
  }, [hasMorePosts, loadPosts]);

  useEffect(() => {
    const initializeApp = async () => {
      if (initializationComplete.current) {
        return;
      }

      console.log('[App] Starting initialization');
      try {
        await loadCredentials();
        await loadTriagedPosts();
        await cleanExpiredTriagedPosts();
        setIsAppReady(true);
        console.log('[App] Initialization complete');
        initializationComplete.current = true;
      } catch (error) {
        console.error('[App] Initialization failed:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isAppReady && !isInitialized && !showConfig && !isComplete && !isLoading.current) {
      console.log('[Effect] Loading initial posts - app is ready');
      loadPosts(true);
    }
  }, [isAppReady, isInitialized, showConfig, isComplete, loadPosts]);

  useEffect(() => {
    console.log('[App] Component mounted');
  }, []);

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
          <TouchableOpacity style={styles.refreshButton} onPress={() => loadPosts(true)}>
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
              onSwipedAll={handleSwipedAll}
              OverlayLabelRight={OverlayLabelRight}
              OverlayLabelLeft={OverlayLabelLeft}
              OverlayLabelTop={OverlayLabelTop}
              OverlayLabelBottom={OverlayLabelBottom}
              swipeRightSpringConfig={SPRING_CONFIG}
              swipeLeftSpringConfig={SPRING_CONFIG}
              swipeTopSpringConfig={SPRING_CONFIG}
              swipeBottomSpringConfig={SPRING_CONFIG}
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
