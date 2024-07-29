import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

const CustomAlert = ({
  showAlert,
  toggleAlert,
  type,
  msg,
  goToHome,
  delSubFunction,
}) => {
  return (
    <Modal
      style={styles.myAlert}
      animationIn="fadeIn"
      animationOut="fadeOut"
      hasBackdrop={true}
      backdropOpacity={0.5}
      isVisible={showAlert}
      onRequestClose={toggleAlert}
      onBackButtonPress={toggleAlert}
    >
      <View className="justify-center items-center bg-slate-800 rounded-2xl py-6 px-8 w-72 shadow-xl">
        <Text className="font-psemibold text-base text-secondary-200 mb-2">
          {type}
        </Text>
        <Text className="mb-6 text-sm font-pregular text-center text-white">
          {msg}
        </Text>

        <TouchableOpacity
          className="bg-secondary rounded-xl min-h-[46px] justify-center items-center w-full"
          activeOpacity={0.7}
          onPress={() => {
            toggleAlert();
            goToHome && goToHome();
            delSubFunction && delSubFunction();
          }}
        >
          <Text className="text-primary font-psemibold text-base">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  myAlert: {
    flex: 0,
    top: "32%",
    alignSelf: "center",
  },
});

export default CustomAlert;
