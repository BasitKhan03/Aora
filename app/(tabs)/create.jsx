import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import * as ImagePicker from "expo-image-picker";

import { icons } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { createVideo } from "../../lib/appwrite";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert";

const Create = () => {
  const { user, refetchPosts, refetchProfilePosts, refetchInitializePosts } =
    useGlobalContext();

  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });

  const scrollRef = useRef();

  useFocusEffect(
    React.useCallback(() => {
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
      });

      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, [])
  );

  const toggleAlert = () => {
    setShowAlert(!showAlert);
  };

  const openPicker = async (selectType) => {
    Keyboard.dismiss();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        selectType === "image"
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({ ...form, thumbnail: result.assets[0] });
      }

      if (selectType === "video") {
        setForm({ ...form, video: result.assets[0] });
      }
    }
  };

  const submit = async () => {
    if (
      form.prompt === "" ||
      form.title === "" ||
      !form.thumbnail ||
      !form.video
    ) {
      setAlert({
        type: "Error!",
        message: "Please fill in all the fields",
      });
      toggleAlert();
    } else {
      setUploading(true);

      try {
        await createVideo({
          ...form,
          userId: user.$id,
        });

        setAlert({
          type: "Success!",
          message: "Post uploaded successfully",
        });

        await refetchInitializePosts();
        await refetchPosts();
        await refetchProfilePosts();

        toggleAlert();
      } catch (error) {
        setAlert({
          type: "Error!",
          message: "Some error occured while uploading the post",
        });
        toggleAlert();
        console.log(error.message);
      } finally {
        setForm({
          title: "",
          video: null,
          thumbnail: null,
          prompt: "",
        });

        setUploading(false);
      }
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView
        className="px-4 my-6"
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
      >
        <Text className="text-2xl text-white font-psemibold">Upload Video</Text>

        <FormField
          title="Video Title"
          value={form.title}
          placeholder="Give your video a catchy title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Video
          </Text>

          <TouchableOpacity onPress={() => openPicker("video")}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {showAlert && (
          <CustomAlert
            msg={alert.message}
            type={alert.type}
            showAlert={showAlert}
            toggleAlert={toggleAlert}
            goToHome={() => router.push("/home")}
          />
        )}

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail Image
          </Text>

          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl z-10"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField
          title="AI Prompt"
          value={form.prompt}
          placeholder="The prompt you used to create this video"
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7 mb-2"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
