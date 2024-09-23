import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, usePathname } from "expo-router";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { signOut, deleteVideo } from "../../lib/appwrite";

import EmptyState from "../../components/EmptyState";
import VideoCard from "../../components/VideoCard";
import InfoBox from "../../components/InfoBox";
import CustomModal from "../../components/CustomModal";
import CustomAlert from "../../components/CustomAlert";

const Profile = () => {
  const {
    user,
    setUser,
    setIsLoggedIn,
    likedVideos,
    likesCount,
    handleLike,
    savedVideos,
    handleSave,
    profilePosts,
    refetchProfilePosts,
    refetchPosts,
    refetchSavedPosts,
  } = useGlobalContext();

  const pathname = usePathname();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });
  const flatListRef = useRef(null);

  const toggleAlert = () => {
    setShowAlert(!showAlert);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchProfilePosts();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      }
    }, [])
  );

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace("/sign-in");
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

  const delSubFunction = async () => {
    await refetchProfilePosts();
    await refetchPosts();
    await refetchSavedPosts();
  };

  const del = async (viedoId) => {
    setDeleting(true);

    try {
      await deleteVideo(viedoId);

      bottomSheetModalRef.current?.close();

      setAlert({
        type: "Success!",
        message: "Post deleted successfully",
      });

      toggleAlert();
    } catch (error) {
      bottomSheetModalRef.current?.close();
      setAlert({
        type: "Error!",
        message: "Some error occured while deleting the post",
      });
      toggleAlert();
      console.log(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        ref={flatListRef}
        data={profilePosts}
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
          <View
            className={`w-full justify-center items-center mt-6 ${
              profilePosts.length > 0 ? "mb-14" : "mb-0"
            } px-4`}
          >
            <View className="w-full flex-row justify-between items-center mb-10 pl-2 pr-1">
              <TouchableOpacity onPress={() => router.push(`/settings`)}>
                <Image
                  source={require("../../assets/icons/settings.png")}
                  tintColor="white"
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <Image
                  source={icons.logout}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
            </View>

            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            {user?.bio && (
              <View className="-mt-2 mb-2 w-full px-8 flex justify-center items-center">
                <Text className="text-xs text-gray-100 text-center font-pregular leading-5">
                  {user?.bio}
                </Text>
              </View>
            )}

            <View className="mt-5 flex-row">
              <InfoBox
                title={profilePosts.length || 0}
                subtitle="Posts"
                containerStyles="mr-10 ml-2"
                titleStyles="text-xl"
              />
              <InfoBox
                title="1.2k"
                subtitle="Followers"
                containerStyles="mr-10"
                titleStyles="text-xl"
              />
              <InfoBox title="10" subtitle="Following" titleStyles="text-xl" />
            </View>

            {showAlert && (
              <CustomAlert
                msg={alert.message}
                type={alert.type}
                showAlert={showAlert}
                toggleAlert={toggleAlert}
                delSubFunction={delSubFunction}
              />
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="You haven't created any videos yet"
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
        pathname={pathname}
        del={del}
        deleting={deleting}
      />
    </SafeAreaView>
  );
};

export default Profile;
