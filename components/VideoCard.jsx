import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";

import { icons } from "../constants";

const VideoCard = ({
  video: {
    $id,
    title,
    prompt,
    thumbnail,
    video,
    creator: { username, avatar },
  },
  isLiked,
  likes,
  onLike,
  isSaved,
  onSave,
  onModalOpen,
  currentPlayingVideo,
  setCurrentPlayingVideo,
}) => {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (currentPlayingVideo !== $id && play) {
      setPlay(false);
    }
  }, [currentPlayingVideo]);

  const handlePlay = () => {
    setCurrentPlayingVideo($id);
    setPlay(true);
  };

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        <TouchableOpacity className="pt-2" onPress={() => onModalOpen()}>
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay={true}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
          activeOpacity={0.7}
          onPress={handlePlay}
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      <View className="w-full mt-6 px-2 flex-row justify-between">
        <View className="flex-row">
          <TouchableOpacity
            className="justify-center items-center mr-4"
            onPress={onLike}
          >
            {isLiked ? (
              <Image
                source={require("../assets/icons/heart-fill.png")}
                className="w-6 h-6"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../assets/icons/heart-empty.png")}
                className="w-6 h-6"
                resizeMode="contain"
                tintColor="white"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="justify-center items-center"
            onPress={onSave}
          >
            {isSaved ? (
              <Image
                source={require("../assets/icons/bookmark-fill.png")}
                className="w-6 h-6"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../assets/icons/bookmark-empty.png")}
                className="w-[23px] h-[23px]"
                resizeMode="cover"
                tintColor="white"
              />
            )}
          </TouchableOpacity>
        </View>

        <View>
          <Text className="text-sm text-gray-100 font-pregular">
            {likes} {likes > 1 ? "likes" : "like"}
          </Text>
        </View>
      </View>
    </View>
  );
};
export default VideoCard;
