import React, { useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, useFocusEffect } from "expo-router";

import { images } from "../../constants";
import { createUSer } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert";

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const toggleAlert = () => {
    setShowAlert(!showAlert);
  };

  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      setAlert({
        type: "Error!",
        message: "Please fill in all the fields",
      });
      toggleAlert();
    } else {
      setIsSubmitting(true);

      try {
        const result = await createUSer(
          form.email,
          form.password,
          form.username
        );

        setUser(result);
        setIsLoggedIn(true);

        router.replace("/home");
      } catch (error) {
        setAlert({
          type: "Error!",
          message: error.message.slice(19),
        });
        toggleAlert();
        console.log(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setForm({
        username: "",
        email: "",
        password: "",
      });
    }, [])
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[35px]"
          />

          <Text className="text-2xl text-white font-semibold mt-10 font-psemibold">
            Sign up to Aora
          </Text>

          {showAlert && (
            <CustomAlert
              msg={alert.message}
              type={alert.type}
              showAlert={showAlert}
              toggleAlert={toggleAlert}
            />
          )}

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-5"
            KeyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-5"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center items-center pt-5 flex-row gap-2">
            <Text className="text-base text-gray-100 font-pregular">
              Already have an account?
            </Text>
            <Link
              href="/sign-in"
              className="text-base font-psemibold text-secondary"
            >
              Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
