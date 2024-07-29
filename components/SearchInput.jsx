import React, { useState, useCallback } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { router, usePathname, useFocusEffect } from "expo-router";

import { icons } from "../constants";
import CustomAlert from "./CustomAlert";

const SearchInput = ({ initialQuery, placeholder, path }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const clearQuery = useCallback(() => {
    setQuery("");
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (pathname === "/home" || pathname === "/bookmark") {
        clearQuery();
      }
    }, [pathname, clearQuery])
  );

  const toggleAlert = () => {
    setShowAlert(!showAlert);
  };

  const search = () => {
    if (!query) {
      setAlert({
        type: "Missing query!",
        message: "Please input something to search results across database",
      });
      toggleAlert();
    } else {
      if (pathname.startsWith("/search")) router.setParams({ query });
      else router.push(`/search/${query}?path=${path}`);
    }
  };

  return (
    <>
      <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
        <TextInput
          className="text-base mt-0.5 text-white flex-1 font-pregular"
          value={query}
          placeholder={placeholder}
          placeholderTextColor="#CDCDE0"
          onChangeText={(e) => setQuery(e)}
          onSubmitEditing={() => search()}
        />

        <TouchableOpacity onPress={search}>
          <Image
            source={icons.search}
            className="w-5 h-5"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {showAlert && (
        <CustomAlert
          msg={alert.message}
          type={alert.type}
          showAlert={showAlert}
          toggleAlert={toggleAlert}
        />
      )}
    </>
  );
};

export default SearchInput;
