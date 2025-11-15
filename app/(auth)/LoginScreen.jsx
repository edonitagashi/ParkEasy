import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

const showAlert = (title, message) => {
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    setTimeout(() => {
      window.alert(`${title}\n\n${message}`);
    }, 50);
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return showAlert("Gabim", "Ju lutem plotësoni email dhe fjalëkalimin.");
    }

    if (!validateEmail(email)) {
      return showAlert("Gabim", "Email-i nuk është në format të saktë.");
    }

    if (!validatePassword(password)) {
      return showAlert(
        "Gabim",
        "Fjalëkalimi duhet të ketë të paktën 8 karaktere, një shkronjë të madhe dhe një numër."
      );
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;

      try {
        const rawUsers = await AsyncStorage.getItem(USERS_KEY);
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        let found = users.find(u => u.email?.toLowerCase() === String(fbUser.email).toLowerCase());

        if (!found) {
          found = {
            id: fbUser.uid,
            name: fbUser.displayName || "User",
            phone: "",
            email: fbUser.email || email,
            password: password,
            avatarUri: fbUser.photoURL || "",
          };
          users.push(found);
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
      } catch (syncErr) {
        console.error("Gabim gjatë sinkronizimit në AsyncStorage:", syncErr);
      }

      setLoading(false);
      router.replace("nearby");
    } catch (error) {
      let message = error.message;

      if (error.code === "auth/wrong-password") {
        message = "Fjalëkalimi është gabim.";
      } else if (error.code === "auth/user-not-found") {
        message = "Email-i nuk ekziston.";
      } else if (error.code === "auth/invalid-email") {
        message = "Email-i nuk është i vlefshëm.";
      }

      showAlert("Gabim", message);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log in</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Fjalëkalimi"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Log in"}</Text>
      </TouchableOpacity>

      <GoogleAuthButton />

      <TouchableOpacity onPress={() => router.push("RegisterScreen")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: "#2E7D6A", padding: 15, borderRadius: 10, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  link: { marginTop: 15, color: "#2E7D6A" },
});
