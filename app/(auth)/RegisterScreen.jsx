import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import GoogleAuthButton from "../../components/GoogleAuthButton";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
   if (!name.trim()) return Alert.alert("Error", "Please enter your name.");
if (!phone.trim()) return Alert.alert("Error", "Please enter your phone number.");
if (!email.trim()) return Alert.alert("Error", "Please enter your email.");
if (password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters long.");
if (password !== confirmPassword) return Alert.alert("Error", "Passwords do not match.");

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      router.replace("/nearby"); 
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
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

      <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
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
