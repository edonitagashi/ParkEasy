import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { router } from "expo-router";

export default function GoogleAuthButton() {

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Signed in:", user.displayName, user.email);
      router.replace("/nearby");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google sign-in failed: " + error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
      <AntDesign name="google" size={22} color="#DB4437" style={{ marginRight: 8 }} />
      <Text style={styles.googleText}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    width: 300,
  },
  googleText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
});
