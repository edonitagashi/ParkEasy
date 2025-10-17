import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kyçu</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
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

      {/* NDRYSHIMI: Shkon te TAB BAR */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.replace({
            pathname: "/screens",
            params: {
              name: email ? email.split("@")[0] : "User",
              email,
              phone: "96034 56878", 
              password: password || "defaultPassword",
            },
          })
        }
      >
        <Text style={styles.buttonText}>Kyçu</Text>
      </TouchableOpacity>

      {/* NDRYSHIMI: Shkon te /auth/register */}
      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text style={styles.link}>Nuk ke llogari? Regjistrohu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: "#2E7D6A", padding: 15, borderRadius: 10, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  link: { marginTop: 15, color: "#2E7D6A" },
});