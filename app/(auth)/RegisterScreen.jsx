import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { auth } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoogleAuthButton from "../../components/GoogleAuthButton";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

const showAlert = (title, message) => {
  if (typeof window !== "undefined" && window.alert) {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  };

  const handleRegister = async () => {
    if (!name.trim()) return showAlert("Gabim", "Ju lutem vendosni emrin tuaj.");
    if (!phone.trim()) return showAlert("Gabim", "Ju lutem vendosni numrin e telefonit.");
    if (!email.trim()) return showAlert("Gabim", "Ju lutem vendosni email-in.");
    if (!validateEmail(email.trim())) return showAlert("Gabim", "Email-i nuk është në format të saktë.");
    if (!validatePassword(password)) return showAlert("Gabim", "Fjalëkalimi duhet të ketë të paktën 8 karaktere, një shkronjë të madhe dhe një numër.");
    if (password !== confirmPassword) return showAlert("Gabim", "Fjalëkalimet nuk përputhen.");

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const fbUser = result.user;

      const newUser = {
        id: fbUser.uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatarUri: fbUser.photoURL || "",
      };

      try {
        const rawUsers = await AsyncStorage.getItem(USERS_KEY);
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        const exists = users.some(u => u.email?.toLowerCase() === newUser.email);

        if (!exists) {
          users.push(newUser);
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      } catch (syncErr) {
        console.error("Gabim gjatë ruajtjes në AsyncStorage:", syncErr);
      }

      setLoading(false);
      router.replace("nearby");
    } catch (error) {
      showAlert("Gabim", error.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <TextInput style={styles.input} placeholder="Emri" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Numri i telefonit" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Fjalëkalimi" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Konfirmo fjalëkalimin" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Create Account"}</Text>
      </TouchableOpacity>

      <GoogleAuthButton />

      <TouchableOpacity onPress={() => router.push("LoginScreen")}>
        <Text style={styles.link}>Already have an account? Log In</Text>
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
