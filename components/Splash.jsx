import React from "react";
import { View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";

const Splash = () => {
  return (
    <>
      <View className="flex-1 bg-primary h-full items-center justify-center">
        <Image
          source={require("../assets/splash.png")}
          resizeMode="contain"
          className="w-[98%] h-[98%]"
        />
      </View>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default Splash;
