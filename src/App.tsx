/* eslint-disable react-native/no-inline-styles */
import type { AppBskyEmbedImages, AppBskyFeedPost } from '@atproto/api';
import type { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';
import ActionButton from './components/ActionButton';
import ConfigurationScreen from './components/ConfigurationScreen';
import { BlueSkyService } from './services/bluesky';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const ICON_SIZE = 24;

type PostData = PostView & { record: AppBskyFeedPost.Record };

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
};

const App = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [showReposts, setShowReposts] = useState(true);
  const ref = useRef<SwiperCardRefType>();
  const bluesky = useRef(new BlueSkyService());
  const [credentials, setCredentials] = useState<{ username: string; appPassword: string }>({
    username: '',
    appPassword: '',
  });
  const [showConfig, setShowConfig] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [deletionQueue, setDeletionQueue] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const loadCredentials = async () => {
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
      const appPassword = await AsyncStorage.getItem(STORAGE_KEYS.APP_PASSWORD);
      const showRepostsStr = await AsyncStorage.getItem(STORAGE_KEYS.SHOW_REPOSTS);

      if (showRepostsStr !== null) {
        setShowReposts(showRepostsStr === 'true');
      }

      if (username && appPassword) {
        setCredentials({ username, appPassword });
        setShowConfig(false);
      } else {
        setShowConfig(true);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      setShowConfig(true);
    }
  };

  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME);
      await AsyncStorage.removeItem(STORAGE_KEYS.APP_PASSWORD);
      setCredentials({ username: '', appPassword: '' });
      setShowConfig(true);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  };

  const handleSaveConfig = async (username: string, appPassword: string, showReposts: boolean) => {
    try {
      if (!username || !appPassword) {
        throw new Error('Username and password are required');
      }

      setIsLoggingIn(true);
      await bluesky.current.login(username, appPassword);

      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
      await AsyncStorage.setItem(STORAGE_KEYS.APP_PASSWORD, appPassword);
      await AsyncStorage.setItem(STORAGE_KEYS.SHOW_REPOSTS, String(showReposts));

      setCredentials({ username, appPassword });
      setShowReposts(showReposts);
      setShowConfig(false);
      loadPosts();
    } catch (error) {
      console.error('Login failed with new credentials:', error);
      Alert.alert('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadPosts = useCallback(async () => {
    if (!credentials.username || !credentials.appPassword || showConfig || isLoggingIn) {
      return;
    }

    setIsLoadingPosts(true);
    console.log('Starting to load posts...');
    try {
      console.log('Attempting login...');
      await bluesky.current.login(credentials.username, credentials.appPassword);
      console.log('Login successful');

      console.log('Fetching user posts...');
      const userPostsResponse = await bluesky.current.getUserPosts();
      console.log(`Received ${userPostsResponse.length} raw posts`);

      const filteredPosts = userPostsResponse.filter(post => {
        if (!showReposts && post.reason?.$type === 'app.bsky.feed.defs#reasonRepost') {
          return false;
        }
        const type = (post.post.record as { $type: string }).$type;
        console.log(`Post type: ${type}`);
        return type === 'app.bsky.feed.post';
      });
      console.log(`Filtered to ${filteredPosts.length} valid posts`);

      const formattedPosts = filteredPosts.map(post => ({
        ...post.post,
        record: post.post.record as AppBskyFeedPost.Record,
      }));
      console.log('Posts formatted successfully');

      setPosts(formattedPosts);
      console.log('Posts loaded into state');
    } catch (error) {
      console.error('Error loading posts:', error);
      await clearCredentials();
    } finally {
      setIsLoadingPosts(false);
    }
  }, [credentials, showReposts, showConfig, isLoggingIn]);

  useEffect(() => {
    loadCredentials();
  }, []); // Only run once on mount

  useEffect(() => {
    loadPosts();
  }, [loadPosts]); // Only run when loadPosts changes

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
        <Text style={styles.statText}>❤️ {postData.likeCount}</Text>
      </View>
    ),
    [],
  );

  const renderCard = useCallback(
    (postData: PostData) => {
      console.log(`Rendering card for post: ${postData.uri}`);
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
    [renderPostImage, renderPostStats],
  );

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
    (direction: string, cardIndex: number) => {
      const postUri = posts[cardIndex]?.uri;
      console.log(`Swiped ${direction} on post ${postUri}`);

      switch (direction) {
        case 'left':
          if (postUri) {
            setDeletionQueue(prev => [...prev, postUri]);
          }
          break;
        case 'right':
          console.log('TODO: Keep post', postUri!);
          break;
        case 'up':
          bluesky.current.repost(postUri!);
          break;
        case 'down':
          console.log('TODO: Snooze post', postUri!);
          break;
      }
    },
    [posts],
  );

  const handleButtonPress = useCallback((action: string) => {
    console.log(`${action} button pressed`);
    switch (action) {
      case 'reload':
        ref.current?.swipeBack();
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
  }, []);

  const processDeletionQueue = useCallback(async () => {
    try {
      for (const uri of deletionQueue) {
        await bluesky.current.deletePost(uri);
      }
      setDeletionQueue([]);
      // loadPosts();
    } catch (error) {
      console.error('Error processing deletion queue:', error);
      Alert.alert('Error', 'Failed to delete some posts. Please try again.');
    }
  }, [deletionQueue]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        {credentials.username ? (
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
      ) : (
        <>
          <View style={styles.subContainer}>
            <Swiper
              ref={ref}
              cardStyle={styles.cardStyle}
              data={posts}
              renderCard={renderCard}
              onSwipeLeft={cardIndex => handleSwipe('left', cardIndex)}
              onSwipeRight={cardIndex => handleSwipe('right', cardIndex)}
              onSwipeTop={cardIndex => handleSwipe('up', cardIndex)}
              onSwipeBottom={cardIndex => handleSwipe('down', cardIndex)}
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
          onSave={handleSaveConfig}
          onLogout={clearCredentials}
          onCancel={() => setShowConfig(false)}
          isLoading={isLoggingIn}
          isLoggedIn={!!credentials.username}
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
});
