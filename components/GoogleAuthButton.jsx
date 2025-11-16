import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Platform, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../app/firebase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Funksion alert per web dhe mobile
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function GoogleAuthButton({ mode = "login" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // gjendje per loading

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      // Sign in me Google (web)
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Kontrollo nese ekziston ne Firestore
      const ref = doc(db, "users", user.uid);
      let snap = await getDoc(ref);

      if (mode === "signup") {
        if (snap.exists()) {
          showAlert("ℹ️ Account already exists", "Please log in instead.");
          router.replace("/LoginScreen");
          setLoading(false);
          return;
        }

        await setDoc(ref, {
          id: user.uid,
          fullName: user.displayName || "Unknown",
          email: user.email,
          avatarUri: user.photoURL || "",
          role: "user",
          status: "active",
          createdAt: serverTimestamp(), 
        });

        snap = await getDoc(ref);

        showAlert("✅ Account created successfully!", "");
      } else {
        if (!snap.exists()) {
          showAlert("❌ Not registered", "Please sign up first.");
          await auth.signOut();
          setLoading(false);
          return;
        }
      }

      // Merr te dhenat e user-it nga Firestore ose default
      const data = snap.exists() ? snap.data() : { role: "user", status: "active" };

      // Kontrollon statusin
      if (data.status === "inactive") {
        showAlert("❌ Account deactivated", "Contact admin for support.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Redirect sipas rolit
      if (data.role === "admin") {
        router.replace("/admin");
      } else if (data.role === "owner") {
        router.replace("/(tabs)/OwnerDashboard");
      } else {
        router.replace("/(tabs)/nearby");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      showAlert("Google sign-in failed", error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth} disabled={loading}>
      <AntDesign name="google" size={22} color="#DB4437" style={{ marginRight: 8 }} />
      <Text style={styles.googleText}>{loading ? "Please wait..." : mode === "signup" ? "Sign up with Google" : "Continue with Google"}</Text>
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
     width: "100%",
  maxWidth: 600,
  },
  googleText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
});