import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function SearchHeader({ title }) {
  const router = useRouter();
  const profileSrc = require("../assets/icon.png"); 

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      
      
      <TouchableOpacity onPress={() => router.push("/screens/profile")}>
        <Image source={profileSrc} style={styles.avatar} />
      </TouchableOpacity>
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
