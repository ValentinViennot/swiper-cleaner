import type { AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';

import ActionButton from './components/ActionButton';
import ConfigurationScreen from './components/ConfigurationScreen';
import { MemoizedCard } from './components/MemoizedCard';
import OverlayLabel from './components/OverlayLabel';
import { SPRING_CONFIG, STORAGE_KEYS } from './constants/storage';
import { BlueSkyService } from './services/bluesky';
import { styles } from './styles/app.styles';
import { theme } from './styles/theme';
import type { PostData, TriagedPostsMap } from './types/post';
import { Mutex } from './utils/Mutex';

configureReanimatedLogger({
  strict: false,
});

const ICON_SIZE = 24;
const blueskyService = new BlueSkyService();
const { colors } = theme;

const App = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [showReposts, setShowReposts] = useState(true);
  const [reviewInterval, setReviewInterval] = useState(30);
  const [triagedPosts, setTriagedPosts] = useState<TriagedPostsMap>(new Map());
  const [deletionQueue, setDeletionQueue] = useState<Array<{ uri: string; isRepost: boolean }>>([]);
  const [credentials, setCredentials] = useState({
    username: '',
    appPassword: '',
  });

  const [showConfig, setShowConfig] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [initializationComplete, setInitializationComplete] = useState(false);

  const [isAppReady, setIsAppReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const ref = useRef<SwiperCardRefType>();
  const swipeMutex = useRef(new Mutex());

  const loadTriagedPosts = useCallback(async () => {
    console.debug('[Storage] Loading triaged posts from AsyncStorage');
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const triagedKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.TRIAGED_PREFIX));
      console.debug(`[Storage] Found ${triagedKeys.length} triaged posts`);

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
        console.debug(`[Storage] Setting review interval to ${interval} days`);
        setReviewInterval(Number(interval));
      }
    } catch (error) {
      console.error('[Storage] Error loading triaged posts:', error);
    }
  }, [setTriagedPosts, setReviewInterval]);

  const addTriagedPost = useCallback(
    async (uri: string) => {
      console.debug(`[Storage] Adding post to triage: ${uri}`);
      const normalizedUri = uri.toLowerCase();
      const timestamp = new Date().toISOString();

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.TRIAGED_PREFIX + normalizedUri, timestamp);
        console.debug('[Storage] Successfully stored triaged post');

        const updatedPosts = new Map(triagedPosts);
        updatedPosts.set(normalizedUri, timestamp);
        setTriagedPosts(updatedPosts);
      } catch (error) {
        console.error('[Storage] Error adding triaged post:', error);
      }
    },
    [triagedPosts, setTriagedPosts],
  );

  const cleanExpiredTriagedPosts = useCallback(async () => {
    if (reviewInterval === 0) {
      console.debug('[Cleanup] Review interval is 0, skipping cleanup');
      return;
    }

    console.debug('[Cleanup] Starting cleanup of expired triaged posts');
    const now = new Date();
    const updatedPosts = new Map(triagedPosts);
    const keysToDelete: string[] = [];

    for (const [uri, timestamp] of updatedPosts) {
      const triagedDate = new Date(timestamp);
      const daysSinceTriaged = Math.floor(
        (now.getTime() - triagedDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceTriaged >= reviewInterval) {
        console.debug(`[Cleanup] Post expired (${daysSinceTriaged} days old): ${uri}`);
        updatedPosts.delete(uri);
        keysToDelete.push(STORAGE_KEYS.TRIAGED_PREFIX + uri);
      }
    }

    if (keysToDelete.length > 0) {
      console.debug(`[Cleanup] Removing ${keysToDelete.length} expired posts`);
      try {
        await AsyncStorage.multiRemove(keysToDelete);
        setTriagedPosts(updatedPosts);
        console.debug('[Cleanup] Successfully removed expired posts');
      } catch (error) {
        console.error('[Cleanup] Error removing expired posts:', error);
      }
    } else {
      console.debug('[Cleanup] No expired posts found');
    }
  }, [triagedPosts, reviewInterval]);

  // Auth Helpers
  const loadCredentials = async () => {
    console.debug('[Auth] Loading credentials from storage');
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      const appPassword = await AsyncStorage.getItem(STORAGE_KEYS.APP_PASSWORD);
      const showRepostsStr = await AsyncStorage.getItem(STORAGE_KEYS.SHOW_REPOSTS);

      if (showRepostsStr !== null) {
        console.debug(`[Auth] Setting show reposts to ${showRepostsStr}`);
        setShowReposts(showRepostsStr === 'true');
      }

      if (username && appPassword) {
        console.debug(`[Auth] Found credentials for user: ${username}`);
        setCredentials({ username, appPassword });
        setShowConfig(false);
      } else {
        console.debug('[Auth] No credentials found, showing config screen');
        setShowConfig(true);
      }
    } catch (error) {
      console.error('[Auth] Error loading credentials:', error);
      setShowConfig(true);
    }
  };

  const clearCredentials = useCallback(async () => {
    console.debug('[Auth] Clearing credentials');
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME);
      await AsyncStorage.removeItem(STORAGE_KEYS.APP_PASSWORD);
      setCredentials({ username: '', appPassword: '' });
      setShowConfig(true);
      console.debug('[Auth] Credentials cleared successfully');
    } catch (error) {
      console.error('[Auth] Error clearing credentials:', error);
    }
  }, [setCredentials, setShowConfig]);

  const handleSaveConfig = async (
    username: string,
    appPassword: string,
    showReposts: boolean,
    reviewInterval: number,
  ) => {
    console.debug('[Config] Saving new configuration');
    try {
      setIsLoggingIn(true);
      if (!username || !appPassword) {
        throw new Error('Username and password are required');
      }

      console.debug('[Config] Attempting login with new credentials');
      await blueskyService.login(username, appPassword);
      console.debug('[Config] Login successful');

      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
      await AsyncStorage.setItem(STORAGE_KEYS.APP_PASSWORD, appPassword);
      await AsyncStorage.setItem(STORAGE_KEYS.SHOW_REPOSTS, String(showReposts));
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_INTERVAL, String(reviewInterval));
      console.debug('[Config] Configuration saved to storage');

      setCredentials({ username, appPassword });
      setShowReposts(showReposts);
      setReviewInterval(reviewInterval);
      setPosts([]);
      setIsComplete(false);
      setIsInitialized(false);

      setShowConfig(false);
      await loadPosts(true);
    } catch (error) {
      console.error('[Config] Login failed:', error);
      Alert.alert('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const canLoadPosts = useCallback(() => {
    return !!(credentials.username && credentials.appPassword && !showConfig && !isLoggingIn);
  }, [credentials.username, credentials.appPassword, showConfig, isLoggingIn]);

  const fetchAndFilterPosts = useCallback(
    async (resetCursor: boolean) => {
      await blueskyService.login(credentials.username, credentials.appPassword);
      const { feed: userPostsResponse, hasMore } = await blueskyService.getUserPosts(resetCursor);

      console.debug(`[Posts] Received ${userPostsResponse.length} raw posts, hasMore: ${hasMore}`);
      // console.debug(JSON.stringify(userPostsResponse));

      setHasMorePosts(hasMore);

      const filteredUris = new Set([
        ...Array.from(triagedPosts.keys()),
        ...deletionQueue.map(item => item.uri),
      ]);

      console.debug(`[Posts] Filtering out ${filteredUris.size} URIs`);

      return userPostsResponse
        .map(post => ({
          ...post.post,
          reply: post.reply
            ? {
                parent:
                  post.reply.parent.$type === 'app.bsky.feed.defs#postView'
                    ? (post.reply.parent as AppBskyFeedDefs.PostView)
                    : undefined,
                root:
                  post.reply.root?.$type === 'app.bsky.feed.defs#postView'
                    ? (post.reply.root as AppBskyFeedDefs.PostView)
                    : undefined,
              }
            : undefined,
          isRepost: post.reason?.$type === 'app.bsky.feed.defs#reasonRepost',
        }))
        .map(post => ({
          ...post,
          type: (post.record as { $type: string }).$type,
          record: post.record as AppBskyFeedPost.Record,
          cardUri: (post.isRepost ? post.viewer!.repost! : post.uri).toLowerCase(),
        }))
        .filter(post => {
          const shouldFilter =
            filteredUris.has(post.cardUri) ||
            (!showReposts && post.isRepost) ||
            post.type !== 'app.bsky.feed.post';

          if (shouldFilter) {
            let filterReason = 'not a post';
            if (filteredUris.has(post.cardUri)) {
              filterReason = 'already processed';
            } else if (!showReposts && post.isRepost) {
              filterReason = 'repost filtered';
            }
            console.debug(`[Posts] Filtering out post: ${post.cardUri} (${filterReason})`);
            return false;
          }
          return true;
        });
    },
    [
      credentials.username,
      credentials.appPassword,
      showReposts,
      triagedPosts,
      deletionQueue,
      setHasMorePosts,
    ],
  );

  // Post Loading
  const loadPosts = useCallback(
    async (resetCursor = false, byPassLoading = false): Promise<boolean> => {
      if ((isLoading && !byPassLoading) || !canLoadPosts()) {
        console.debug('[Posts] Skipping load - already loading or missing requirements');
        return false;
      }

      console.debug('[Posts] Starting to load posts');
      setIsLoading(true);
      setIsComplete(false);

      try {
        const posts = await fetchAndFilterPosts(resetCursor);
        if (posts.length === 0) {
          if (!hasMorePosts) {
            console.debug('[Posts] No posts remaining after filtering and no more available');
            setIsComplete(true);
            setIsLoading(false);
            return false;
          } else {
            console.debug('[Posts] No posts after filtering, loading more...');
            return loadPosts(false, true);
          }
        }

        setPosts(posts);
        setIsComplete(false);
        setIsInitialized(true);
        return true;
      } catch (error) {
        console.error('[Posts] Error loading posts:', error);
        await clearCredentials();
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [canLoadPosts, fetchAndFilterPosts, hasMorePosts, clearCredentials, isLoading],
  );

  const renderCard = useCallback(
    (postData: PostData) => <MemoizedCard postData={postData} isRepost={!!postData.isRepost} />,
    [],
  );

  const createOverlayLabel = useCallback((text: string, color: string) => {
    const Label = () => <OverlayLabel text={text} color={color} />;
    Label.displayName = `OverlayLabel${text}`;
    return Label;
  }, []);

  const OverlayLabelRight = createOverlayLabel('KEEP', colors.overlayLike);
  const OverlayLabelLeft = createOverlayLabel('DELETE', colors.overlayNope);
  const OverlayLabelTop = createOverlayLabel('REPOST', colors.primary);
  const OverlayLabelBottom = createOverlayLabel('SNOOZE', colors.warning);

  const handleDeleteSwipe = useCallback(
    async (post: PostData) => {
      console.debug('[Delete] Adding post to deletion queue:', post.cardUri);
      return new Promise<void>(resolve => {
        setDeletionQueue(prev => {
          const existingIndex = prev.findIndex(item => item.uri === post.cardUri);
          if (existingIndex >= 0) {
            return prev;
          }
          return [...prev, { uri: post.cardUri, isRepost: !!post.isRepost }];
        });
        resolve();
      });
    },
    [setDeletionQueue],
  );

  const handleKeepSwipe = useCallback(
    async (postUri: string, repostCid?: string) => {
      if (repostCid) {
        console.debug('[Swipe] Reposting post:', postUri);
        await blueskyService.repost(postUri, repostCid);
      } else {
        console.debug('[Swipe] Keeping post:', postUri);
      }
      await addTriagedPost(postUri);
    },
    [addTriagedPost],
  );

  const handleSnoozeSwipe = useCallback(
    async (post: PostData) => {
      console.debug('[Swipe] Snoozing post:', post.uri);
      return new Promise<void>(resolve => {
        setPosts(prevPosts => [...prevPosts, post]);
        resolve();
      });
    },
    [setPosts],
  );

  const handleSwipe = useCallback(
    async (direction: string, cardIndex: number) => {
      console.debug(`[Swipe] Handling swipe ${direction} for card ${cardIndex}`);

      if (!posts.length) {
        console.debug('[Swipe] No posts available');
        return;
      }

      await swipeMutex.current.acquire();
      try {
        const post = posts[cardIndex];
        if (!post) {
          console.debug('[Swipe] Invalid card index:', cardIndex);
          throw new Error('Invalid card index');
        }

        if (!post.cardUri) {
          console.debug('[Swipe] Post has no URI:', post);
          throw new Error('Invalid post URI (no URI)');
        }

        // Wait for the appropriate action to complete before proceeding
        switch (direction) {
          case 'left':
            await handleDeleteSwipe(post);
            break;
          case 'up':
          case 'right':
            if (deletionQueue.find(item => item.uri === post.cardUri)) {
              Alert.alert(
                `Cannot ${direction === 'right' ? 'keep' : 'repost'} this post`,
                'This post is already queued for deletion. Please restart the app to undo this.',
                [{ text: 'OK' }],
              );
              break;
            }
            await handleKeepSwipe(post.cardUri, direction === 'up' ? post.cid : undefined);
            break;
          case 'down':
            await handleSnoozeSwipe(post);
            break;
        }

        // If this is the last card and we have more posts to load
        if (cardIndex === posts.length - 1 && hasMorePosts) {
          await loadPosts(false);
        }
      } catch (error) {
        console.error('[Swipe] Error processing swipe:', error);
      } finally {
        swipeMutex.current.release();
      }
    },
    [
      posts,
      hasMorePosts,
      handleDeleteSwipe,
      deletionQueue,
      handleKeepSwipe,
      handleSnoozeSwipe,
      loadPosts,
    ],
  );

  const removeFromTriaged = useCallback(
    async (uri: string) => {
      console.debug(`[Storage] Removing post from triage: ${uri}`);
      const normalizedUri = uri.toLowerCase();
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.TRIAGED_PREFIX + normalizedUri);
        const updatedPosts = new Map(triagedPosts);
        updatedPosts.delete(normalizedUri);
        setTriagedPosts(updatedPosts);
        console.debug('[Storage] Successfully removed post from triage');
      } catch (error) {
        console.error('[Storage] Error removing post from triage:', error);
      }
    },
    [triagedPosts, setTriagedPosts],
  );

  const rewindToPreviousPost = useCallback(async () => {
    if (currentIndex > 0) {
      const rewindedPost = posts[currentIndex - 1];
      if (rewindedPost) {
        console.debug('[Button] Removing post from queues:', rewindedPost.cardUri);
        setDeletionQueue(prev => prev.filter(item => item.uri !== rewindedPost.cardUri));
        await removeFromTriaged(rewindedPost.cardUri);
      }
      ref.current?.swipeBack();
    }
  }, [currentIndex, posts, removeFromTriaged]);

  const handleButtonPress = useCallback(
    (action: string) => {
      console.debug(`[Button] ${action} button pressed`);
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
    console.debug('[App] Processing deletion queue');
    try {
      const results = await blueskyService.batchDelete(deletionQueue);
      const failures = results.filter(r => !r.success);

      if (failures.length > 0) {
        console.warn('[App] Some deletions failed:', failures);
        Alert.alert(
          'Some deletions failed',
          `${failures.length} items could not be deleted. They will remain in the queue.`,
        );
        setDeletionQueue(prev => prev.filter(item => failures.some(f => f.uri === item.uri)));
      } else {
        setDeletionQueue([]);
      }
    } catch (error) {
      console.error('[App] Batch deletion error:', error);
      Alert.alert('Error', 'Failed to process deletion queue. Please try again.');
    }
  }, [deletionQueue]);

  const handleReset = useCallback(async () => {
    console.debug('[Reset] Starting reset process');
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const triagedKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.TRIAGED_PREFIX));
      console.debug(`[Reset] Found ${triagedKeys.length} triaged keys to remove`);
      await AsyncStorage.multiRemove(triagedKeys);

      console.debug('[Reset] Clearing application state');
      setTriagedPosts(new Map());
      setPosts([]);
      setDeletionQueue([]);
      setCurrentIndex(0);
      setIsComplete(false);
      setIsInitialized(false);
      setShowConfig(false);

      await new Promise(resolve => setTimeout(resolve, 100));

      console.debug('[Reset] Loading fresh posts');
      const result = await loadPosts(true);
      console.debug('[Reset] Load posts result:', { result, hasMorePosts, posts: posts.length });
    } catch (error) {
      console.error('[Reset] Error resetting triaged posts:', error);
      Alert.alert('Error', 'Failed to reset triaged posts. Please try again.');
    }
  }, [loadPosts, posts.length, hasMorePosts]);

  const handleSwipedAll = useCallback(() => {
    console.debug('[Swiper] Reached end of stack');
    if (!hasMorePosts) {
      console.debug('[Swiper] No more posts available');
      setIsComplete(true);
    }
  }, [hasMorePosts]);

  useEffect(() => {
    if (initializationComplete || isInitializing) {
      return;
    }
    console.debug('[App] Starting initialization');
    setIsInitializing(true);
    loadCredentials()
      .then(() => loadTriagedPosts())
      .then(() => cleanExpiredTriagedPosts())
      .then(() => setIsAppReady(true))
      .then(() => console.debug('[App] Initialization complete'))
      .then(() => setInitializationComplete(true))
      .catch(error => console.error('[App] Initialization failed:', error))
      .finally(() => setIsInitializing(false));
  }, [initializationComplete, cleanExpiredTriagedPosts, isInitializing, loadTriagedPosts]);

  useEffect(() => {
    if (
      isAppReady &&
      !isInitialized &&
      !showConfig &&
      !isComplete &&
      !isLoading &&
      !isInitializing
    ) {
      console.debug('[Effect] Loading initial posts - app is ready');
      setIsLoading(true);
      loadPosts(true, true).then(() => setIsLoading(false));
    }
  }, [isAppReady, isInitialized, showConfig, isComplete, loadPosts, isLoading, isInitializing]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {!showConfig && deletionQueue.length > 0 ? (
            <TouchableOpacity style={styles.confirmButton} onPress={processDeletionQueue}>
              <Text style={styles.confirmButtonText}>DELETE ({deletionQueue.length})</Text>
            </TouchableOpacity>
          ) : !showConfig ? (
            <TouchableOpacity
              style={styles.donateButton}
              onPress={() =>
                Linking.openURL(
                  'https://polar.sh/smashchats/products/85592438-13d5-4310-ab04-bc77aa9adc69',
                )
              }>
              <Text>❤️ Donate</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.headerRight} onPress={() => setShowConfig(true)}>
          <Text style={styles.userInfoText} numberOfLines={1} ellipsizeMode="tail">
            {credentials.username}
          </Text>
          <AntDesign
            name="setting"
            size={24}
            color={colors.textSecondary}
            style={styles.settingsIcon}
          />
        </TouchableOpacity>
      </View>

      <GestureHandlerRootView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : isComplete ? (
          <View style={styles.completeContainer}>
            {deletionQueue.length > 0 ? (
              <>
                <Text style={styles.completeText}>Almost done!</Text>
                <Text style={styles.completeSubtext}>
                  Don&apos;t forget to confirm deletion of {deletionQueue.length} post
                  {deletionQueue.length !== 1 ? 's' : ''}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.completeText}>All done! 🎉</Text>
                <Text style={styles.completeSubtext}>
                  {reviewInterval > 0
                    ? `Come back in ${reviewInterval} days to review more posts`
                    : 'No more posts to review'}
                </Text>
                <TouchableOpacity style={styles.refreshButton} onPress={() => loadPosts(true)}>
                  <Text style={styles.refreshButtonText}>Check Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <>
            <View style={styles.subContainer}>
              <Swiper
                ref={ref}
                cardStyle={styles.cardStyle}
                data={posts}
                renderCard={renderCard}
                onIndexChange={index => setCurrentIndex(index)}
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
                inputOverlayLabelRightOpacityRange={[0, theme.layout.windowWidth / 2]}
                outputOverlayLabelRightOpacityRange={[0, 1]}
                inputOverlayLabelLeftOpacityRange={[0, -(theme.layout.windowWidth / 2)]}
                outputOverlayLabelLeftOpacityRange={[0, 1]}
                inputOverlayLabelTopOpacityRange={[0, -(theme.layout.windowHeight / 2)]}
                outputOverlayLabelTopOpacityRange={[0, 1]}
              />
            </View>

            <View style={styles.buttonsContainer}>
              <ActionButton
                style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
                onTap={() => currentIndex > 0 && handleButtonPress('reload')}>
                <AntDesign
                  name="reload1"
                  size={ICON_SIZE}
                  color="white"
                  style={currentIndex === 0 ? styles.iconDisabled : undefined}
                />
              </ActionButton>
              <ActionButton style={styles.button} onTap={() => handleButtonPress('delete')}>
                <AntDesign name="close" size={ICON_SIZE} color="white" />
              </ActionButton>
              <ActionButton style={styles.button} onTap={() => handleButtonPress('snooze')}>
                <AntDesign name="arrowdown" size={ICON_SIZE} color="white" />
              </ActionButton>
              <ActionButton style={styles.button} onTap={() => handleButtonPress('keep')}>
                <AntDesign name="retweet" size={ICON_SIZE} color="white" />
              </ActionButton>
              <ActionButton style={styles.button} onTap={() => handleButtonPress('like')}>
                <AntDesign name="heart" size={ICON_SIZE} color="white" />
              </ActionButton>
            </View>
          </>
        )}
      </GestureHandlerRootView>

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
          hasTriagedPosts={triagedPosts.size + deletionQueue.length > 0}
        />
      )}
    </SafeAreaView>
  );
};

export default App;
