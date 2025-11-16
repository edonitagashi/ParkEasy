import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase"; 
import GoogleAuthButton from "../../components/GoogleAuthButton";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Error", "Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      showAlert("Error", "Invalid email format.");
      return;
    }
    if (!validatePassword(password)) {
      showAlert("Error", "Password must be at least 8 characters, include one uppercase letter and one number.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        showAlert("Error", "Profile not found in Firestore.");
        setLoading(false);
        return;
      }

      const data = snap.data();

      if (data.status === "inactive") {
        showAlert("Account Disabled", "❌ This account has been deactivated by an admin.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      if (data.role === "admin") {
        router.replace("/dashboard");  
      } else {
        router.replace("/home");       
      }

    } catch (error) {
      showAlert("Login Error", error.message);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Access your Parking App account</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Login"}</Text>
      </TouchableOpacity>

      {/* Google login button */}
<GoogleAuthButton mode="login" />

      <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
        <Text style={styles.switchText}>
          Don’t have an account? <Text style={styles.link}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", color: "#000", marginTop: 10 },
  subtitle: { textAlign: "center", color: "gray", marginBottom: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginBottom: 12 },
  button: { backgroundColor: "#2E7D6A", padding: 14, borderRadius: 10, width: "100%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  switchText: { marginTop: 15, color: "#555" },
  link: { color: "#2E7D6A", fontWeight: "bold" },
});