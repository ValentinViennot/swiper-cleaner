/* eslint-disable react-native/no-inline-styles */
import type { AppBskyEmbedImages, AppBskyFeedPost } from "@atproto/api";
import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { AntDesign } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";
import ActionButton from "../components/ActionButton";
import { BlueSkyService } from "./services/bluesky";

const ICON_SIZE = 24;

type PostData = PostView & { record: AppBskyFeedPost.Record };

const App = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const ref = useRef<SwiperCardRefType>();
  const bluesky = useRef(new BlueSkyService());

  useEffect(() => {
    const loadPosts = async () => {
      console.log("Starting to load posts...");
      try {
        console.log("Attempting login...");
        await bluesky.current.login(
          "username",
          "password"
        );
        console.log("Login successful");

        console.log("Fetching user posts...");
        const userPostsResponse = await bluesky.current.getUserPosts();
        console.log(`Received ${userPostsResponse.length} raw posts`);

        const filteredPosts = userPostsResponse.filter((post) => {
          const type = (post.post.record as { $type: string }).$type;
          console.log(`Post type: ${type}`);
          return type === "app.bsky.feed.post";
        });
        console.log(`Filtered to ${filteredPosts.length} valid posts`);

        const formattedPosts = filteredPosts.map((post) => ({
          ...post.post,
          record: post.post.record as AppBskyFeedPost.Record,
        }));
        console.log("Posts formatted successfully");

        setPosts(formattedPosts);
        console.log("Posts loaded into state");
      } catch (error) {
        console.error("Error loading posts:", error);
      }
    };
    loadPosts();
  }, []);

  const renderCard = useCallback((postData: PostData) => {
    console.log(`Rendering card for post: ${postData.uri}`);
    return (
      <View style={styles.renderCardContainer}>
        <View style={styles.cardContent}>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: postData.author.avatar }}
              style={styles.avatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.displayName}>
                {postData.author.displayName}
              </Text>
              <Text style={styles.handle}>@{postData.author.handle}</Text>
            </View>
          </View>

          <Text style={styles.postText}>{postData.record.text}</Text>

          {postData.embed?.$type === "app.bsky.embed.images#view" && (
            <View style={styles.imageContainer}>
              {(postData.embed as AppBskyEmbedImages.View).images.map(
                (img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img.thumb }}
                    style={[
                      styles.postImage,
                      {
                        aspectRatio:
                          (img.aspectRatio?.width ?? 1) /
                          (img.aspectRatio?.height ?? 1),
                      },
                    ]}
                  />
                )
              )}
            </View>
          )}

          <View style={styles.postFooter}>
            <Text style={styles.dateText}>
              {new Date(postData.record.createdAt).toLocaleString()}
            </Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statText}>💬 {postData.replyCount}</Text>
              <Text style={styles.statText}>🔁 {postData.repostCount}</Text>
              <Text style={styles.statText}>❤️ {postData.likeCount}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, []);

  const OverlayLabelRight = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: "green",
          },
        ]}
      />
    );
  }, []);
  const OverlayLabelLeft = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: "red",
          },
        ]}
      />
    );
  }, []);
  const OverlayLabelTop = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: "blue",
          },
        ]}
      />
    );
  }, []);
  const OverlayLabelBottom = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: "orange",
          },
        ]}
      />
    );
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.subContainer}>
        <Swiper
          ref={ref}
          cardStyle={styles.cardStyle}
          data={posts}
          renderCard={renderCard}
          onSwipeLeft={(cardIndex) => {
            console.log(`Swiped left on post ${posts[cardIndex]?.uri}`);
            bluesky.current.deletePost(posts[cardIndex]?.uri!);
          }}
          onSwipeRight={(cardIndex) => {
            console.log(`Swiped right on post ${posts[cardIndex]?.uri}`);
            console.log("TODO: Keep post", posts[cardIndex]?.uri!);
          }}
          onSwipeTop={(cardIndex) => {
            console.log(`Swiped up on post ${posts[cardIndex]?.uri}`);
            bluesky.current.repost(posts[cardIndex]?.uri!);
          }}
          onSwipeBottom={(cardIndex) => {
            console.log(`Swiped down on post ${posts[cardIndex]?.uri}`);
            console.log("TODO: Snooze post", posts[cardIndex]?.uri!);
          }}
          OverlayLabelRight={OverlayLabelRight}
          OverlayLabelLeft={OverlayLabelLeft}
          OverlayLabelTop={OverlayLabelTop}
          OverlayLabelBottom={OverlayLabelBottom}
          // Add these spring configs for faster animations
          swipeRightSpringConfig={{
            stiffness: 200,
            damping: 15,
            mass: 1,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          }}
          swipeLeftSpringConfig={{
            stiffness: 200,
            damping: 15,
            mass: 1,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          }}
          swipeTopSpringConfig={{
            stiffness: 200,
            damping: 15,
            mass: 1,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          }}
          swipeBottomSpringConfig={{
            stiffness: 200,
            damping: 15,
            mass: 1,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          }}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <ActionButton
          style={styles.button}
          onTap={() => {
            console.log("Reload button pressed");
            ref.current?.swipeBack();
          }}
        >
          <AntDesign name="reload1" size={ICON_SIZE} color="white" />
        </ActionButton>
        <ActionButton
          style={styles.button}
          onTap={() => {
            console.log("Delete button pressed");
            ref.current?.swipeLeft();
          }}
        >
          <AntDesign name="close" size={ICON_SIZE} color="white" />
        </ActionButton>
        <ActionButton
          style={styles.button}
          onTap={() => {
            console.log("Snooze button pressed");
            ref.current?.swipeBottom();
          }}
        >
          <AntDesign name="arrowdown" size={ICON_SIZE} color="white" />
        </ActionButton>
        <ActionButton
          style={styles.button}
          onTap={() => {
            console.log("Keep button pressed");
            ref.current?.swipeTop();
          }}
        >
          <AntDesign name="arrowup" size={ICON_SIZE} color="white" />
        </ActionButton>
        <ActionButton
          style={styles.button}
          onTap={() => {
            console.log("Like button pressed");
            ref.current?.swipeRight();
          }}
        >
          <AntDesign name="heart" size={ICON_SIZE} color="white" />
        </ActionButton>
      </View>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    bottom: 34,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  button: {
    height: 50,
    borderRadius: 40,
    aspectRatio: 1,
    backgroundColor: "#3A3D45",
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardStyle: {
    width: "95%",
    height: "75%",
    borderRadius: 15,
    marginVertical: 20,
  },
  renderCardContainer: {
    flex: 1,
    borderRadius: 15,
    height: "75%",
    width: "100%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: "#000",
  },
  handle: {
    fontSize: 14,
    color: "#666",
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#2C2C2C",
    marginBottom: 12,
  },
  imageContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: undefined,
    borderRadius: 8,
  },
  postFooter: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  dateText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  subContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayLabelContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
});
