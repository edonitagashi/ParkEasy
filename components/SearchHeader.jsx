import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <Ionicons name="menu-outline" size={28} color="#5C8374" />
      </TouchableOpacity>
      <Text style={styles.title}>Search Parking</Text>
      <View style={{ width: 28 }} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
