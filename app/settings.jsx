import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { useGlobalContext } from "../context/GlobalProvider";
import {
  changePassword,
  changeUsername,
  changeImage,
  changeBio,
  getCurrentUser,
} from "../lib/appwrite";
import { icons } from "../constants";
import FormField from "../components/FormField";
import CustomButton from "../components/CustomButton";
import CustomAlert from "../components/CustomAlert";

const settings = () => {
  const { user, setUser } = useGlobalContext();

  const [editProfile, setEditProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username);
  const [bio, setBio] = useState(user?.bio);
  const [image, setImage] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    new: "",
    repeat: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const toggleAlert = () => {
    setShowAlert(!showAlert);
  };

  const openPicker = async () => {
    Keyboard.dismiss();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      if (image !== null) {
        await changeImage(user.$id, image.uri);
        setImage(null);
      }

      if (username !== user?.username) {
        await changeUsername(user.$id, username);
      }

      if (bio !== user?.bio) {
        await changeBio(user.$id, bio);
      }

      if (image !== null || username !== user?.username || bio !== user?.bio) {
        getCurrentUser()
          .then((res) => {
            if (res) {
              setUser(res);
              setUsername(res?.username);
              setBio(res?.bio);
            }
          })
          .catch((error) => console.log(error));

        setAlert({
          type: "Success!",
          message: "Your profile has been updated successfully",
        });
        toggleAlert();
      }
    } catch (error) {
      setAlert({
        type: "Error!",
        message: error.message.slice(19),
      });
      toggleAlert();
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (
      password.current === "" ||
      password.new === "" ||
      password.repeat === ""
    ) {
      setAlert({
        type: "Error!",
        message: "Please fill in all the fields",
      });
      toggleAlert();
    } else {
      if (password.new !== password.repeat) {
        setAlert({
          type: "Error!",
          message: "Passwords do not match",
        });
        toggleAlert();
      } else {
        setPasswordLoading(true);
        try {
          await changePassword(password.new, password.current);
          setAlert({
            type: "Success!",
            message: "Your password has been changed successfully",
          });
          toggleAlert();
          setPassword({
            current: "",
            new: "",
            repeat: "",
          });
        } catch (error) {
          setAlert({
            type: "Error!",
            message:
              error.message ===
              "AppwriteException: Invalid credentials. Please check the email and password."
                ? "Invalid credentials. Please check the current password."
                : error.message.slice(19),
          });
          toggleAlert();
          console.log(error.message);
        } finally {
          setPasswordLoading(false);
        }
      }
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView
        className="px-4 my-6 pb-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl text-white font-psemibold">
          Account Settings
        </Text>

        <View className="flex-row justify-evenly mt-10 w-full align-middle bg-black-200 rounded-full">
          <View
            className={`py-3 justify-center items-center rounded-full w-[42%] ${
              editProfile ? "bg-secondary-100" : "bg-black-200"
            }`}
          >
            <TouchableOpacity
              className="flex-row justify-center items-center w-full ml-2"
              onPress={() => setEditProfile(true)}
            >
              <Text
                className={`text-sm ${
                  editProfile ? "font-pbold" : "font-psemibold"
                } ${editProfile ? "text-black-100" : "text-white"}`}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className={`py-3 justify-center items-center rounded-full w-[58%] ${
              !editProfile ? "bg-secondary-100" : "bg-black-200"
            }`}
          >
            <TouchableOpacity
              className="flex-row justify-center items-center w-full ml-2"
              onPress={() => setEditProfile(false)}
            >
              <Text
                className={`text-sm right-1 ${
                  !editProfile ? "font-pbold" : "font-psemibold"
                } ${!editProfile ? "text-black-100" : "text-white"}`}
              >
                Change Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showAlert && (
          <CustomAlert
            msg={alert.message}
            type={alert.type}
            showAlert={showAlert}
            toggleAlert={toggleAlert}
          />
        )}

        {editProfile ? (
          <View>
            <View className="w-full justify-center items-center mt-12">
              <TouchableOpacity
                className="w-20 h-20 border border-secondary rounded-lg justify-center items-center"
                onPress={openPicker}
              >
                {image ? (
                  <Image
                    source={{ uri: image.uri }}
                    className="w-[90%] h-[90%] rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={{ uri: user?.avatar }}
                    className="w-[90%] h-[90%] rounded-lg"
                    resizeMode="cover"
                  />
                )}
                <Image
                  source={icons.plus}
                  tintColor="#FF9001"
                  className="w-5 h-5 rounded-lg absolute -bottom-2 -right-2"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>

            <FormField
              title="Your Name"
              value={username}
              placeholder="Give yourself a cool name..."
              handleChangeText={(e) => setUsername(e)}
              otherStyles="mt-7"
            />

            <FormField
              title="Profile Bio"
              value={bio}
              placeholder="Introduce yourself to the community..."
              handleChangeText={(e) => setBio(e)}
              otherStyles="mt-7"
            />

            <CustomButton
              title="Save changes"
              handlePress={handleSaveChanges}
              containerStyles="mt-8 mb-2"
              isLoading={loading}
            />
          </View>
        ) : (
          <View>
            <FormField
              title="Current Password"
              value={password.current}
              placeholder="Enter current password"
              handleChangeText={(e) => setPassword({ ...password, current: e })}
              otherStyles="mt-12"
            />

            <FormField
              title="New Password"
              value={password.new}
              placeholder="Enter a new password"
              handleChangeText={(e) => setPassword({ ...password, new: e })}
              otherStyles="mt-7"
            />

            <FormField
              title="Repeat Password"
              value={password.repeat}
              placeholder="Repeat new password"
              handleChangeText={(e) => setPassword({ ...password, repeat: e })}
              otherStyles="mt-7"
            />

            <CustomButton
              title="Save password"
              handlePress={handleSavePassword}
              containerStyles="mt-8 mb-4"
              isLoading={passwordLoading}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default settings;
