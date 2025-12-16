import React, { useState } from "react";
import theme from "../../components/theme";
const { colors } = theme;
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import GoogleAuthButton from "../../components/GoogleAuthButton";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ROLE
  const [role, setRole] = useState("user");

  // OWNER fields
  const [parkingName, setParkingName] = useState("");
  const [parkingAddress, setParkingAddress] = useState("");
  const [parkingPrice, setParkingPrice] = useState("");
  const [parkingSpots, setParkingSpots] = useState("");

  const [loading, setLoading] = useState(false);

  const showAlert = (title, message) => {
    if (Platform.OS === "web") alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleRegister = async () => {
    // BASIC INPUT VALIDATION
    if (!name.trim()) return showAlert("Error", "Please enter your name.");
    if (!phone.trim()) return showAlert("Error", "Please enter your phone number.");
    if (!email.trim()) return showAlert("Error", "Please enter your email.");
    if (!validateEmail(email.trim())) return showAlert("Error", "Invalid email format.");
    if (!validatePassword(password)) return showAlert("Error", "Password must be at least 6 characters.");
    if (password !== confirmPassword) return showAlert("Error", "Passwords do not match.");

    // OWNER FIELDS VALIDATION
    if (role === "owner") {
      if (!parkingName.trim() || !parkingAddress.trim() || !parkingPrice || !parkingSpots) {
        return showAlert("Error", "Please fill all parking fields.");
      }
    }

    setLoading(true);

    try {
      // CREATE AUTH ACCOUNT
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const fbUser = result.user;

      // SAVE BASIC USER DATA
      await setDoc(doc(db, "users", fbUser.uid), {
        id: fbUser.uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        avatarUri: fbUser.photoURL || "",
        role: role,
        createdAt: new Date(),
        ownerStatus: role === "owner" ? "pending" : null,
        ownerRequestId: null,
      });

      // --- OWNER REGISTER LOGIC ---
      if (role === "owner") {
        // CREATE OWNER REQUEST
        const reqRef = await addDoc(collection(db, "ownerRequests"), {
          userId: fbUser.uid,
          fullName: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          parkingName,
          address: parkingAddress,
          price: Number(parkingPrice),
          totalSpots: Number(parkingSpots),
          status: "pending",
          createdAt: serverTimestamp(),
        });

        // ADD REQUEST ID TO USER DOCUMENT
        await setDoc(
          doc(db, "users", fbUser.uid),
          {
            ownerRequestId: reqRef.id,
            ownerStatus: "pending",
          },
          { merge: true }
        );

        // SEND OWNER TO HOME SCREEN
        router.replace("/owner/home");
      } 
      // --- NORMAL USER ---
      else {
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
  <ScrollView contentContainerStyle={styles.scroll}>
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <Text style={styles.label}>Register as:</Text>

      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleButton, role === "user" && styles.roleButtonActive]}
          onPress={() => setRole("user")}
        >
          <Text style={[styles.roleText, role === "user" && styles.roleTextActive]}>User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "owner" && styles.roleButtonActive]}
          onPress={() => setRole("owner")}
        >
          <Text style={[styles.roleText, role === "owner" && styles.roleTextActive]}>Owner</Text>
        </TouchableOpacity>
      </View>

      {role === "owner" && (
        <View style={styles.ownerBox}>
          <TextInput style={styles.input} placeholder="Parking name" value={parkingName} onChangeText={setParkingName} />
          <TextInput style={styles.input} placeholder="Parking address" value={parkingAddress} onChangeText={setParkingAddress} />
          <TextInput style={styles.input} placeholder="Price (€)" keyboardType="numeric" value={parkingPrice} onChangeText={setParkingPrice} />
          <TextInput style={styles.input} placeholder="Total spots" keyboardType="numeric" value={parkingSpots} onChangeText={setParkingSpots} />
        </View>
      )}

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
  </ScrollView>
);
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  container: {
    width: "100%",
    maxWidth: 600,
    
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  label: {
    width: "100%",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },

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
    color: colors.textOnPrimary,
  },

  ownerBox: {
    width: "100%",
    marginTop: 10,
  },

  button: {
    backgroundColor: "#2E7D6A",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: colors.textOnPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },

  switchText: {
    marginTop: 15,
    color: "#555",
    textAlign: "center",
  },

  link: {
    color: "#2E7D6A",
    fontWeight: "bold",
  },
});
