import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

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
    <LinearGradient colors={["#E8F3F1", "#C7E3DA", "#A4D4C5"]} style={styles.gradient}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        {/* IKONA SI LOGO */}
        <View style={styles.iconContainer}>
          <Ionicons name="car-outline" size={90} color="#2E7D6A" />
        </View>

        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>ParkEasy</Text>
        <Text style={styles.subtitle}>Find and reserve your parking spot effortlessly</Text>

        <Link href="/screens/LoginScreen" asChild>
          <TouchableOpacity style={styles.buttonPrimary}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/screens/RegisterScreen" asChild>
          <TouchableOpacity style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>Register</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ffffffcc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    color: "#3A5A40",
    fontWeight: "500",
    textAlign: "center",
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#2E7D6A",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#5C8374",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2E7D6A",
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#2E7D6A",
    paddingVertical: 15,
    paddingHorizontal: 65,
    borderRadius: 14,
  },
  buttonSecondaryText: {
    color: "#2E7D6A",
    fontSize: 18,
    fontWeight: "700",
  },
});
