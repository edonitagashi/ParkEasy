import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

export default function Home() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 1,
        bounciness: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#E9F8F6", "#D7EEE8", "#C4E3DD"]} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9F8F6" />
      <Animated.ScrollView
        contentContainerStyle={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER IMAGE */}
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/2333/2333229.png",
          }}
          style={styles.headerImage}
        />

        {/* APP TITLE */}
        <Text style={styles.appTitle}>ParkEasy</Text>
        <Text style={styles.welcomeText}>Welcome to the world of effortless parking.</Text>

        {/* INFO BANNER */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Special Offer!</Text>
          <Text style={styles.bannerText}>
            Reserve your first parking spot and get 20% off your first hour. 🚗
          </Text>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <Link href="/screens/LoginScreen" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/screens/RegisterScreen" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupText}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 25,
  },
  headerImage: {
    width: 220,
    height: 220,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2E7D6A",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    color: "#4C6E64",
    marginVertical: 8,
  },
  banner: {
    backgroundColor: "#BFE5D7",
    padding: 15,
    borderRadius: 14,
    marginTop: 25,
    marginBottom: 40,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5E4D",
    marginBottom: 5,
  },
  bannerText: {
    fontSize: 14,
    textAlign: "center",
    color: "#2F6657",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  loginButton: {
    backgroundColor: "#2E7D6A",
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  signupButton: {
    borderWidth: 2,
    borderColor: "#2E7D6A",
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  signupText: {
    color: "#2E7D6A",
    fontSize: 18,
    fontWeight: "700",
  },
});
