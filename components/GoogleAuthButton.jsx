import React, { useEffect, useState } from "react";
import { Text, StyleSheet, Platform, Alert, View } from "react-native";
import AnimatedTouchable from "./animation/AnimatedTouchable";
import { colors, spacing, radii, typography } from "./theme";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import * as WebBrowser from "expo-web-browser";
import * as GoogleAuthSession from "expo-auth-session/providers/google";
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function GoogleAuthButton({ mode = "login" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({ useProxy: true });

  const WEB_CLIENT_ID = "870817184581-mgvsnc9fnbo70v8tk84n7vfaglkbi1hp.apps.googleusercontent.com";

  const [request, response, promptAsync] = GoogleAuthSession.useAuthRequest({
    // Use your Web OAuth client ID for Expo Go (proxy)
    expoClientId: WEB_CLIENT_ID,
    iosClientId: WEB_CLIENT_ID,
    androidClientId: WEB_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: "id_token",
  });

  useEffect(() => {
    console.log("Auth request object:", request);
    console.log("Google AuthSession response:", response);

    if (response?.type === "success") {
      const authentication = response.authentication ?? {};
      const params = response.params ?? {};

      (async () => {
        setLoading(true);
        try {
          const idToken = authentication.idToken ?? params.id_token ?? null;
          const accessToken = authentication.accessToken ?? params.access_token ?? null;

          if (!idToken && !accessToken) {
            console.error("No idToken or accessToken returned from Google", { response });
            showAlert("Google sign-in failed", "No id_token or access_token returned.");
            return;
          }

          const credential = GoogleAuthProvider.credential(idToken, accessToken);
          const result = await signInWithCredential(auth, credential);
          await handleUserAfterSignIn(result.user);
        } catch (err) {
          console.error("Google auth error:", err);
          showAlert("Google sign-in failed", err?.message || String(err));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [response]);

  const handleGoogleAuth = async () => {
    if (!request) {
      console.error("AuthSession request is null — check client IDs/redirect URI configuration");
      showAlert("Google sign-in failed", "AuthSession request not initialized. Ensure client IDs are correct.");
      return;
    }

    await promptAsync({ useProxy: Platform.OS !== "web" });
  };

  const handleUserAfterSignIn = async (user) => {
    const ref = doc(db, "users", user.uid);
    let snap = await getDoc(ref);

    if (mode === "signup") {
      if (snap.exists()) {
        showAlert(" Account already exists", "Please log in instead.");
        router.replace("/LoginScreen");
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
      showAlert(" Account created successfully!", "");
    } else {
      if (!snap.exists()) {
        showAlert(" Not registered", "Please sign up first.");
        await auth.signOut();
        return;
      }
    }

    const data = snap.exists() ? snap.data() : { role: "user", status: "active" };

    if (data.status === "inactive") {
      showAlert(" Account deactivated", "Contact admin for support.");
      await auth.signOut();
      return;
    }

    if (data.role === "admin") {
      router.replace("/admin");
    } else if (data.role === "owner") {
      router.replace("/(tabs)/OwnerDashboard");
    } else {
      router.replace("/(tabs)/nearby");
    }
  };

  return (
    <AnimatedTouchable style={styles.googleBtn} onPress={handleGoogleAuth} disabled={loading}>
      <AntDesign name="google" size={22} color="#DB4437" style={styles.icon} />
      <Text style={styles.googleText}>{loading ? "Please wait..." : mode === "signup" ? "Sign up with Google" : "Continue with Google"}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    width: '100%',
    shadowColor: 'transparent',
    elevation: 0,
  },
  icon: { marginRight: spacing.sm },
  googleText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
