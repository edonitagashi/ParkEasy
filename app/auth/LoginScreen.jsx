import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser"; // opsionale: ruaje sesionin

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // 1) Lexo listën e përdoruesve
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users = raw ? JSON.parse(raw) : [];

      if (!Array.isArray(users) || users.length === 0) {
        return Alert.alert("Gabim", "S’ka llogari të regjistruar. Regjistrohu fillimisht.");
      }

      // 2) Gjej përdoruesin sipas email + password
      const me = users.find(
        (u) =>
          u.email?.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );

      if (!me) {
        return Alert.alert("Gabim", "Email ose fjalëkalim i pasaktë.");
      }

      // 3) (Opsionale) Ruaje sesionin
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me));

      // 4) Sukses → shko te Nearby
      router.replace("/screens/nearby");
    } catch (e) {
      console.error("Login read error:", e);
      Alert.alert("Gabim", "Nuk po lexohen të dhënat lokale.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kyçu</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Kyçu</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/RegisterScreen")}>
        <Text style={styles.link}>Nuk ke llogari? Regjistrohu</Text>
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
