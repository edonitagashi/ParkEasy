// app/auth/RegisterScreen.jsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "users";              // lista e përdoruesve
const CURRENT_USER_KEY = "currentUser"; // sesioni aktiv

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!name.trim()) return Alert.alert("Gabim", "Shkruaj emrin.");
    if (!phone.trim()) return Alert.alert("Gabim", "Shkruaj numrin e telefonit.");
    if (!email.trim()) return Alert.alert("Gabim", "Shkruaj email-in.");
    if (password.length < 6) return Alert.alert("Gabim", "Fjalëkalimi duhet të ketë të paktën 6 karaktere.");
    if (password !== confirmPassword) return Alert.alert("Gabim", "Fjalëkalimet nuk përputhen.");

    try {
      // 1) Lexo listën ekzistuese të përdoruesve
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users = raw ? JSON.parse(raw) : [];

      // 2) Kontrollo duplikimin e email-it
      const exists = users.some((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
      if (exists) return Alert.alert("Gabim", "Ky email ekziston. Përdor një tjetër.");

      // 3) Shto përdoruesin e ri
      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password, // (projekt demo) – mos e ruaj plaintext në prodhim
      };
      const next = [...users, newUser];

      // 4) Ruaje listën
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(next));

      // 5) ✅ AUTO-LOGIN: ruaje sesionin
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

      // 6) Shko direkt te Nearby (ose te Login nëse s’do auto-login)
      router.replace("/screens/nearby");
    } catch (e) {
      console.error("Register save error:", e);
      Alert.alert("Gabim", "Nuk u ruajtën të dhënat.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regjistrohu</Text>

      <TextInput style={styles.input} placeholder="Emri" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Numri i telefonit" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Fjalëkalimi" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Konfirmo fjalëkalimin" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Krijo llogari</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/LoginScreen")}>
        <Text style={styles.link}>Ke tashmë llogari? Kyçu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: "#2E7D6A", padding: 15, borderRadius: 10, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  link: { marginTop: 15, color: "#2E7D6A" },
});
