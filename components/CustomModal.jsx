import React, { useState } from "react";
import { View, Text, Share } from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import CustomButton from "./CustomButton";
import CustomAlert from "./CustomAlert";

const CustomModal = ({
  bottomSheetModalRef,
  snapPoints,
  renderBackdrop,
  selectedVideo,
  pathname,
  del,
  deleting,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const toggleAlert = () => {
    setShowAlert(!showAlert);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: selectedVideo.title + ": " + selectedVideo.video,
      });
    } catch (error) {
      setAlert({
        type: "Error!",
        message: "Some error occurred while sharing the post",
      });
      toggleAlert();
      console.log(error.message);
    }
  };

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: "white" }}
        handleStyle={{
          backgroundColor: "#1E1E2D",
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          shadowColor: "black",
          height: 35,
          alignItems: "center",
          justifyContent: "center",
        }}
        overDragResistanceFactor={1}
        backdropComponent={renderBackdrop}
      >
        {showAlert && (
          <CustomAlert
            msg={alert.message}
            type={alert.type}
            showAlert={showAlert}
            toggleAlert={toggleAlert}
          />
        )}

        <BottomSheetScrollView
          style={{ backgroundColor: "#232533", height: "100%" }}
        >
          {selectedVideo && (
            <View className="mt-5 w-full px-4">
              <Text className="text-center text-base underline text-secondary-200 font-psemibold">
                Prompt
              </Text>
              <View className="mt-3 px-4">
                <Text className="text-white text-sm font-pregular text-center ">
                  "{selectedVideo.prompt}"
                </Text>
              </View>

              {pathname === "/profile" ? (
                <View className="w-full flex-row justify-around">
                  <CustomButton
                    title="Delete"
                    containerStyles="mt-8 w-[45%] bg-red-100"
                    handlePress={() => del(selectedVideo.$id)}
                    isLoading={deleting}
                  />
                  <CustomButton
                    title="Share"
                    containerStyles="mt-8 w-[45%]"
                    handlePress={onShare}
                  />
                </View>
              ) : (
                <CustomButton
                  title="Share"
                  containerStyles="mt-8"
                  handlePress={onShare}
                />
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default CustomModal;
