// app/admin/_layout.jsx
import { Stack } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
<<<<<<< Updated upstream
import { auth } from "../firebase/firebase";
import theme, { colors } from "../../components/theme";
=======
import { auth } from "../../firebase/firebase";
>>>>>>> Stashed changes
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
        backgroundColor: colors.surface,

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
          <MaterialIcons name="logout" size={20} color={colors.textOnPrimary} />
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
    backgroundColor: colors.primary,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },
  title: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: "bold",
  },
  logoutBtn: {
    flexDirection: "row",
    gap: theme.spacing.sm - theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: colors.danger,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: colors.textOnPrimary,
    fontWeight: "600",
  },
});
