import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AnimatedTouchable from "./animation/AnimatedTouchable";
import { Ionicons } from "@expo/vector-icons";
import theme from "./theme";
import { useRouter } from "expo-router";
import { colors } from "./theme";

function AdminBackHeader({ title }) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/admin");
    }
  };

  return (
    <View style={styles.header}>
      <AnimatedTouchable onPress={handleBack} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.textOnPrimary} />
      </AnimatedTouchable>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textOnPrimary,
    flex: 1,
    textAlign: "center",
    marginRight: 24,
  },
});

export default React.memo(AdminBackHeader);