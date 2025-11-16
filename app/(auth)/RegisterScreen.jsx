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
  
  // NEW: role state
  const [role, setRole] = useState("user"); // "user" ose "owner"

  const [loading, setLoading] = useState(false);
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6; // Relaxed: minimum 6 chars

  const handleRegister = async () => {
    if (!name.trim()) return showAlert("Error", "Please enter your name.");
    if (!phone.trim()) return showAlert("Error", "Please enter your phone number.");
    if (!email.trim()) return showAlert("Error", "Please enter your email.");
    if (!validateEmail(email.trim())) return showAlert("Error", "Invalid email format.");
    if (!validatePassword(password)) return showAlert("Error", "Password must be at least 6 characters.");
    if (password !== confirmPassword) return showAlert("Error", "Passwords do not match.");

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const fbUser = result.user;

      // SAVE USER WITH ROLE
      await setDoc(doc(db, "users", fbUser.uid), {
        id: fbUser.uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        avatarUri: fbUser.photoURL || "",
        role: role,       // 👈 NEW
        status: "active",
        createdAt: new Date(),
      });

      // OWNER LOGIC
      if (role === "owner") {
        // Owner dashboard removed — send owners to nearby for now
        router.replace("/(tabs)/nearby");
      } else {
        router.replace("/(tabs)/nearby");
      }

    } catch (error) {
      console.error("Register error:", error);
      showAlert("Error", error.message);
    } finally {
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


      {/* NEW: ROLE SELECTOR */}
      <Text style={styles.label}>Register as:</Text>

      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleButton, role === "user" && styles.roleButtonActive]}
          onPress={() => setRole("user")}
        >
          <Text style={[styles.roleText, role === "user" && styles.roleTextActive]}>
            User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "owner" && styles.roleButtonActive]}
          onPress={() => setRole("owner")}
        >
          <Text style={[styles.roleText, role === "owner" && styles.roleTextActive]}>
            Owner
          </Text>
        </TouchableOpacity>
      </View>


      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : "Create Account"}</Text>
      </TouchableOpacity>

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
  
  // NEW STYLES
  label: { width: "100%", fontSize: 16, marginBottom: 8, fontWeight: "600" },
  roleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#2E7D6A",
    paddingVertical: 12,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#2E7D6A",
  },
  roleText: {
    color: "#2E7D6A",
    fontWeight: "bold",
  },
  roleTextActive: {
    color: "white",
  },

  button: { backgroundColor: "#2E7D6A", padding: 15, borderRadius: 10, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  link: { color: "#2E7D6A", fontWeight: "bold" },
  switchText: { marginTop: 15, color: "#555" },
});
