import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import { useGlobalContext } from "../../context/GlobalProvider";
import { searchPosts, searchSavedPosts } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import VideoCard from "../../components/VideoCard";
import CustomModal from "../../components/CustomModal";
import CustomAlert from "../../components/CustomAlert";

const Search = () => {
  const { user, likedVideos, likesCount, savedVideos, handleLike, handleSave } =
    useGlobalContext();
  const { query, path } = useLocalSearchParams();
  const {
    data: posts,
    refetch,
    isLoading,
    alert,
    showAlert,
    toggleAlert,
  } = useAppwrite(() => searchPosts(query));
  const {
    data: savedPosts,
    refetch: refetchSavedPosts,
    isLoading: isSavedPostsLoading,
    alert: savedPostsAlert,
    showAlert: savedPostsShowAlert,
    toggleAlert: savedPostsToggleAlert,
  } = useAppwrite(() => searchSavedPosts(user.$id, query));

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);

  useEffect(() => {
    path === "home" ? refetch() : refetchSavedPosts();
  }, [query]);

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

  const renderEmptyComponent = () => {
    if (isLoading || isSavedPostsLoading) {
      return (
        <View className="flex-1 h-full justify-center items-center mt-24">
          <ActivityIndicator size="large" color="#FF9001" />
          <Text className="text-white mt-4 font-pregular">Loading...</Text>
        </View>
      );
    } else {
      return (
        <EmptyState
          title="No Videos Found"
          subtitle="No videos found for this search query"
        />
      );
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={path === "home" ? posts : savedPosts}
        keyExtractor={(item) => item.$id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            isLiked={likedVideos[item.$id]}
            onLike={() => handleLike(item.$id)}
            likes={likesCount[item.$id]}
            isSaved={savedVideos[item.$id]}
            onSave={() => handleSave(item.$id)}
            onModalOpen={() => handlePresentModalPress(item.$id, item.prompt)}
            currentPlayingVideo={currentPlayingVideo}
            setCurrentPlayingVideo={setCurrentPlayingVideo}
          />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Search Results
            </Text>
            <Text className="text-2xl font-psemibold text-white">{query}</Text>

            <View className="mt-6 mb-8">
              <SearchInput
                initialQuery={query}
                placeholder="Search for a video topic"
              />
            </View>

            {showAlert && (
              <CustomAlert
                msg={alert.message}
                type={alert.type}
                showAlert={showAlert}
                toggleAlert={toggleAlert}
              />
            )}

            {savedPostsShowAlert && (
              <CustomAlert
                msg={savedPostsAlert.message}
                type={savedPostsAlert.type}
                showAlert={savedPostsShowAlert}
                toggleAlert={savedPostsToggleAlert}
              />
            )}
          </View>
        )}
        ListEmptyComponent={renderEmptyComponent}
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

export default Search;
