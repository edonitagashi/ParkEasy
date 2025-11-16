// app/admin/_layout.jsx
import { Stack } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function AdminLayout() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.replace("/(auth)/LoginScreen");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",

        // 🔥 KY FIX E BEN ADMIN PANEL ME U SCROLLU NË WEB
        ...(Platform.OS === "web" && {
          minHeight: "100vh",
          overflowY: "auto",
        }),
      }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* RENDER ADMIN SCREENS */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2E7D6A",
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  logoutBtn: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
});
