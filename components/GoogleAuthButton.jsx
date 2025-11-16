import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../app/firebase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function GoogleAuthButton({ mode = "login" }) {
  const router = useRouter();

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      //Sign in me Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      //Kontrollo nëse ekziston në Firestore
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (mode === "signup") {
        if (snap.exists()) {
          showAlert("ℹ️ Account already exists", "Please log in instead.");
          return;
        }
        await setDoc(ref, {
          fullName: user.displayName || "Unknown",
          email: user.email,
          avatarUri: user.photoURL || "",
          role: "user",
          status: "active",
          createdAt: new Date()
        });
        showAlert("✅ Account created successfully!", "");
      } else {
        if (!snap.exists()) {
          showAlert("❌ Not registered", "Please sign up first.");
          await auth.signOut();
          return;
        }
      }

      const data = snap.exists() ? snap.data() : { role: "user", status: "active" };

      //Kontrollo status
      if (data.status === "inactive") {
        showAlert("❌ Account deactivated", "Contact admin for support.");
        await auth.signOut();
        return;
      }

      //Redirect sipas rolit
      if (data.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/nearby");
      }

    } catch (error) {
      console.error("Google auth error:", error);
      showAlert("Google sign-in failed", error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth}>
      <AntDesign name="google" size={22} color="#DB4437" style={{ marginRight: 8 }} />
      <Text style={styles.googleText}>
        {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
      </Text>
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
