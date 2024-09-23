import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getLatestPosts } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import SearchInput from "../../components/SearchInput";
import Trending from "../../components/Trending";
import EmptyState from "../../components/EmptyState";
import VideoCard from "../../components/VideoCard";
import CustomModal from "../../components/CustomModal";
import CustomAlert from "../../components/CustomAlert";

const Home = () => {
  const {
    user,
    likedVideos,
    likesCount,
    savedVideos,
    handleLike,
    handleSave,
    posts,
    fetchPosts,
    refetchPosts,
    loadingMore,
    setLoadingMore,
    hasMore,
    setHasMore
  } = useGlobalContext();
  const {
    data: latestPosts,
    alert,
    showAlert,
    toggleAlert,
  } = useAppwrite(getLatestPosts);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPosts();
    setRefreshing(false);
  };

  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["30%", "35%"], []);

  const handlePresentModalPress = useCallback((videoId, videoTitle) => {
    setSelectedVideo({ id: videoId, prompt: videoTitle });
    bottomSheetModalRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={false}
        onPress={() => bottomSheetModalRef.current?.dismiss()}
      />
    ),
    []
  );

  useFocusEffect(
    useCallback(() => {
      return () => bottomSheetModalRef.current?.close();
    }, [])
  );

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
  
    setLoadingMore(true);
    const currentOffset = posts.length; 
  
    try {
      const fetchedPosts = await fetchPosts(false, currentOffset);
  
      if (fetchedPosts && fetchedPosts.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const memoizedHandleLike = useCallback(
    (videoId) => {
      handleLike(videoId);
    },
    [handleLike]
  );

  const memoizedHandleSave = useCallback(
    (videoId) => {
      handleSave(videoId);
    },
    [handleSave]
  );

  const memoizedRenderItem = useCallback(
    ({ item }) => (
      <VideoCard
        video={item}
        isLiked={likedVideos[item.$id]}
        likes={likesCount[item.$id]}
        onLike={() => memoizedHandleLike(item.$id)}
        isSaved={savedVideos[item.$id]}
        onSave={() => memoizedHandleSave(item.$id)}
        onModalOpen={() => handlePresentModalPress(item.$id, item.prompt)}
        currentPlayingVideo={currentPlayingVideo}
        setCurrentPlayingVideo={setCurrentPlayingVideo}
      />
    ),
    [
      likedVideos,
      likesCount,
      savedVideos,
      currentPlayingVideo,
      memoizedHandleLike,
      memoizedHandleSave,
      handlePresentModalPress,
    ]
  );

  const memoizedListHeaderComponent = useMemo(
    () => (
      <View className="my-6 px-4 space-y-6">
        <View className="justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">
              Welcome back,
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              {user?.username}
            </Text>
          </View>

          <View className="mt-1.5">
            <Image
              source={images.logoSmall}
              className="w-9 h-10"
              resizeMode="contain"
            />
          </View>
        </View>

        <SearchInput placeholder="Search for a video topic" path="home" />

        <View className="w-full pt-4 pb-8">
          <Text className="text-gray-100 text-base font-pregular mb-3">
            Trending Videos
          </Text>

          <Trending latestPosts={latestPosts} />
        </View>

        {showAlert && (
          <CustomAlert
            msg={alert.message}
            type={alert.type}
            showAlert={showAlert}
            toggleAlert={toggleAlert}
          />
        )}
      </View>
    ),
    [user, latestPosts, showAlert, alert]
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        keyboardShouldPersistTaps="handled"
        renderItem={memoizedRenderItem}
        ListHeaderComponent={memoizedListHeaderComponent}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Be the first one to upload a video"
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#161622"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View className="pt-0 pb-8">
              <ActivityIndicator size="large" color="#FF9001" />
            </View>
          ) : null
        }
      />

      <CustomModal
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        renderBackdrop={renderBackdrop}
        selectedVideo={selectedVideo}
      />
    </SafeAreaView>
  );
};

export default Home;
