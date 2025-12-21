
import { Stack } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import theme, { colors } from "../hooks/theme";
import { auth } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Admin Panel</Text>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <MaterialIcons name="logout" size={20} color={colors.textOnPrimary} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

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
    elevation: 5,
  },
  headerContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
