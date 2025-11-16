import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../firebase/firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import GoogleAuthButton from "../../components/GoogleAuthButton";


export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleRegister = async () => {
    if (!name.trim()) return showAlert("Error", "Please enter your name.");
    if (!phone.trim()) return showAlert("Error", "Please enter your phone number.");
    if (!email.trim()) return showAlert("Error", "Please enter your email.");
    if (!validateEmail(email.trim())) return showAlert("Error", "Invalid email format.");
    if (!validatePassword(password)) return showAlert("Error", "Password must be at least 8 characters, include one uppercase letter and one number.");
    if (password !== confirmPassword) return showAlert("Error", "Passwords do not match.");

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const fbUser = result.user;
      showAlert("Success", `Firebase Auth user created: ${fbUser.email}`);

      await setDoc(doc(db, "users", fbUser.uid), {
        id: fbUser.uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        avatarUri: fbUser.photoURL || "",
        role: "user",      
        status: "active",   
        createdAt: new Date()
      });
      showAlert("Success", "User document saved in Firestore!");

      setLoading(false);
      router.replace("/nearby"); 
    } catch (error) {
      console.error("Register error:", error);
      showAlert("Error", error.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Create Account"}</Text>
      </TouchableOpacity>

      {/* Google signup button */}
      <GoogleAuthButton mode="signup" />

      <TouchableOpacity onPress={() => router.push("LoginScreen")}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
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
  link: { color: "#2E7D6A", fontWeight: "bold" },
  switchText: { marginTop: 15, color: "#555" },
});