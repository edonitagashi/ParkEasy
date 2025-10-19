
import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, Image, StatusBar, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, speed: 1, bounciness: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    (async () => {
      
      const oldEntries = await AsyncStorage.multiGet(["name","phone","email","password","avatarUri"]);
      const old = Object.fromEntries(oldEntries || []);
      if (old.email && old.password) {
        const rawUsers = await AsyncStorage.getItem(USERS_KEY);
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        const exists = users.some(u => u.email?.toLowerCase() === String(old.email).toLowerCase());
        if (!exists) {
          users.push({
            id: Date.now().toString(),
            name: old.name || "User",
            phone: old.phone || "",
            email: String(old.email).toLowerCase(),
            password: old.password,
            avatarUri: old.avatarUri || "",
          });
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
        await AsyncStorage.multiRemove(["name","phone","email","password","avatarUri"]);
      }

      
      const cur = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (cur) {
        router.replace("/nearby");
      } else {
        // qëndro këtu (faqja e hyrjes) – ose shko te Login nëse e preferon:
        // router.replace("/auth/LoginScreen");
      }
    })();
  }, []);

  return (
    <LinearGradient colors={["#E9F8F6", "#D7EEE8", "#C4E3DD"]} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9F8F6" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <Text style={styles.appName}>ParkEasy</Text>
          <Image source={require("../assets/images/index5.jpg")} style={styles.headerImage} resizeMode="contain" />
          <Text style={styles.subtitle}>Find and reserve your parking spot effortlessly.</Text>
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Smart Parking Starts Here</Text>
            <Text style={styles.bannerText}>Save time and secure your perfect spot in just a few taps.</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Link href="/LoginScreen" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryText}>Login</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/RegisterScreen" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>Register</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  container: {
    alignItems: "center", justifyContent: "center", width: "90%",
    backgroundColor: "#FFFFFFDD", borderRadius: 20, paddingVertical: 40, paddingHorizontal: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8,
  },
  headerImage: { width: 600, height: 300, marginBottom: 10, borderRadius: 12 },
  appName: {
    fontSize: 38, fontWeight: "900", color: "#2E7D6A", textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginBottom: 10,
  },
  subtitle: { fontSize: 16, color: "#4C6E64", textAlign: "center", marginTop: 8, marginBottom: 25 },
  banner: {
    backgroundColor: "#BFE5D7", borderRadius: 14, padding: 18, width: "100%", alignItems: "center", marginBottom: 35,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  bannerTitle: { fontSize: 18, fontWeight: "700", color: "#1E5E4D", marginBottom: 6 },
  bannerText: { fontSize: 14, color: "#2F6657", textAlign: "center" },
  buttonContainer: { width: "100%", alignItems: "center" },
  primaryButton: {
    backgroundColor: "#2E7D6A", width: "80%", paddingVertical: 14, borderRadius: 14, alignItems: "center",
    justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3,
    shadowRadius: 6, elevation: 5, marginBottom: 15,
  },
  primaryText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  secondaryButton: { width: "80%", paddingVertical: 14, borderWidth: 2, borderColor: "#2E7D6A", borderRadius: 14, alignItems: "center" },
  secondaryText: { color: "#2E7D6A", fontSize: 18, fontWeight: "700" },
});
