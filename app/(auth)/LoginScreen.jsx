import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);



  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill in both email and password.");
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle navigation
    } catch (error) {
      Alert.alert("Gabim", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && loading) {
        try {
          // Find user in AsyncStorage and save as current user
          const rawUsers = await AsyncStorage.getItem(USERS_KEY);
          const users = rawUsers ? JSON.parse(rawUsers) : [];
          const foundUser = users.find(u => u.email?.toLowerCase() === user.email?.toLowerCase());
          
          if (foundUser) {
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
          }
          router.replace("nearby");
        } catch (err) {
          console.error("Error saving current user:", err);
        }
      }
    });
    return unsubscribe;
  }, [loading]);

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
