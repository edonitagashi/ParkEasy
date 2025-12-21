import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../app/hooks/theme";

function SearchHeader({ title, onBackPress, onNotificationPress }) {
  const insets = useSafeAreaInsets();


  const paddingTop = Platform.OS === "ios" ? insets.top + 8 : insets.top + 8;

  const iconTop = Platform.OS === "ios" ? insets.top - 6 : 0;

  return (
    <View style={[styles.container, { paddingTop }]}>
      {onBackPress && (
        <TouchableOpacity
          style={[styles.iconButton, { left: 16, top: iconTop }]}
          onPress={onBackPress}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#2E7D6A" />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title}</Text>

      {onNotificationPress && (
        <TouchableOpacity
          style={[styles.iconButton, { right: 16, top: iconTop }]}
          onPress={onNotificationPress}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={26} color="#2E7D6A" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface || "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.secondary || "#333333",
  },
  iconButton: {
    position: "absolute",
    padding: 10,
  },
});

export default React.memo(SearchHeader);