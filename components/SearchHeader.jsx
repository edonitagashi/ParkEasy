import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchHeader({title}) {
  return (
    <View style={styles.header}>
       
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 28 }} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center", 
  paddingHorizontal: 16,
  paddingVertical: 14,
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
},

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5C8374", 
  },
});
