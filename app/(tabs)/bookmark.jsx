import React, { useState, useRef, useCallback, useMemo } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import { useGlobalContext } from "../../context/GlobalProvider";
import SearchInput from "../../components/SearchInput";
import VideoCard from "../../components/VideoCard";
import EmptyState from "../../components/EmptyState";
import CustomModal from "../../components/CustomModal";

const Bookmark = () => {
  const {
    likedVideos,
    likesCount,
    savedVideos,
    handleLike,
    handleSave,
    savedPosts,
    refetchSavedPosts,
  } = useGlobalContext();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchSavedPosts();
    setRefreshing(false);
  };

  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "40%"], []);

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

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.$id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            isLiked={likedVideos[item.$id]}
            likes={likesCount[item.$id]}
            onLike={() => handleLike(item.$id)}
            isSaved={savedVideos[item.$id]}
            onSave={() => handleSave(item.$id)}
            onModalOpen={() => handlePresentModalPress(item.$id, item.prompt)}
            currentPlayingVideo={currentPlayingVideo}
            setCurrentPlayingVideo={setCurrentPlayingVideo}
          />
        )}
        ListHeaderComponent={() => (
          <View className="mt-6 mb-12 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <Text className="text-2xl text-white font-psemibold">
                Saved Videos
              </Text>
            </View>

            <SearchInput
              placeholder="Search your saved videos"
              path="bookmark"
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Save your favorite videos to view here"
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

export default Bookmark;
