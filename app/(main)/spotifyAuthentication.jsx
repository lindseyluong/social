import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, SafeAreaView, Pressable } from "react-native";
import { Entypo, AntDesign } from "@expo/vector-icons"; // AntDesign used for button icon
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const clientId = "c5edf098beca4efaae3699dcff8aede4";
const scopes = [
  "user-read-email",
  "user-library-read",
  "user-read-recently-played",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
];
const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

const AuthenticateSpotify = () => {
  const navigation = useNavigation();
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  useEffect(() => {
    const checkTokenValid = async () => {
      const accessToken = await AsyncStorage.getItem("token");
      const expirationDate = await AsyncStorage.getItem("expirationDate");

      if (accessToken && expirationDate) {
        const currentTime = Date.now();
        if (currentTime < parseInt(expirationDate)) {
          // Token is still valid, navigate to home
          router.push("/home");
        } else {
          // Token expired, remove from async storage
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("expirationDate");
        }
      }
    };
    checkTokenValid();
  }, [navigation]);

  const authenticate = async () => {
    if (isBrowserOpen) {
      console.warn("Authentication attempt blocked: browser session already open.");
      return; // Prevent multiple sessions from being opened simultaneously
    }

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes.join(
      " "
    )}&show_dialog=true`;

    try {
      setIsBrowserOpen(true);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url) {
        const accessToken = getUrlParam(result.url, "access_token");
        const expiresIn = getUrlParam(result.url, "expires_in");

        if (accessToken) {
          const expirationDate = Date.now() + parseInt(expiresIn) * 1000;

          // Store access token and expiration date in async storage
          await AsyncStorage.setItem("token", accessToken);
          await AsyncStorage.setItem("expirationDate", expirationDate.toString());

          // Navigate to home screen
          router.push("/home");
        }
      } else {
        console.log("Authentication failed or was canceled.");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setIsBrowserOpen(false);
    }
  };

  const getUrlParam = (url, param) => {
    const regex = new RegExp(`[?&#]${param}=([^&#]*)`, 'i');
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ height: 80 }} />
      <Entypo style={{ textAlign: "center" }} name="spotify" size={80} color="black" />
      <Text
        style={{
          color: "black",
          fontSize: 40,
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 40,
        }}
      >
        Find love through music!
      </Text>
      <View style={{ height: 85 }} />
      <Pressable
        onPress={authenticate}
        style={{
          backgroundColor: "#1DB954",
          padding: 10,
          marginLeft: "auto",
          marginRight: "auto",
          width: 300,
          borderRadius: 25,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Sign in with Spotify</Text>
      </Pressable>

      {/* Small Pressable button to navigate to the Home Page */}
      <Pressable
        onPress={() => router.push("/home")}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#1DB954",
          padding: 10,
          borderRadius: 50,
        }}
      >
        <AntDesign name="home" size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};

export default AuthenticateSpotify;