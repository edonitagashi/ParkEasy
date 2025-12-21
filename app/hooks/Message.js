import React from "react";
import { View, Text } from "react-native";
import { colors, spacing } from "./theme";

export default function Message({ icon = "✔", text = "Success!", color = colors.success, bg = colors.surface, style = {}, textStyle = {}, iconStyle = {} }) {
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: 16,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: color,
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          flexDirection: "column",
        },
        style,
      ]}
    >
      <Text style={[{ fontSize: 32, fontWeight: "bold", color, marginBottom: 4 }, iconStyle]}>{icon}</Text>
      <Text style={[{ fontSize: 18, fontWeight: "700", color: colors.primary, textAlign: "center", letterSpacing: 0.5 }, textStyle]}>{text}</Text>
    </View>
  );
}
