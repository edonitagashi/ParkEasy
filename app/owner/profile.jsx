import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { router } from "expo-router";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Profile() {
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [supportOpen, setSupportOpen] = useState(false);

  const toggleSupport = () => {
    LayoutAnimation.easeInEaseOut();
    setSupportOpen(!supportOpen);
  };

  const loadData = async () => {
    const uRef = await getDoc(doc(db, "users", user.uid));
    const u = uRef.data();
    setUserData(u);

    if (u.ownerRequestId) {
      const rRef = await getDoc(doc(db, "ownerRequests", u.ownerRequestId));
      setRequestData(rRef.data());
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResubmit = async () => {
    if (!requestData) return;

    // Create NEW request
    const newReq = await addDoc(collection(db, "ownerRequests"), {
      userId: user.uid,
      fullName: requestData.fullName,
      phone: requestData.phone,
      email: requestData.email,
      parkingName: requestData.parkingName,
      address: requestData.address,
      price: requestData.price,
      totalSpots: requestData.totalSpots,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // Update user status
    await updateDoc(doc(db, "users", user.uid), {
      ownerStatus: "pending",
      ownerRequestId: newReq.id,
    });

    alert("Resubmitted successfully!");
    router.replace("/owner/OwnerHomeScreen");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)/LoginScreen");
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owner Profile</Text>

      {/* USER INFO */}
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Your Information</Text>
        <Text style={styles.item}>Name: {userData.name}</Text>
        <Text style={styles.item}>Email: {userData.email}</Text>
        <Text style={styles.item}>Phone: {userData.phone}</Text>
      </View>

      {/* PARKING INFO */}
      {requestData && (
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Parking Information</Text>
          <Text style={styles.item}>Parking: {requestData.parkingName}</Text>
          <Text style={styles.item}>Address: {requestData.address}</Text>
          <Text style={styles.item}>Price: €{requestData.price}</Text>
          <Text style={styles.item}>Total Spots: {requestData.totalSpots}</Text>

          <Text
            style={[
              styles.status,
              userData.ownerStatus === "pending" && { color: "#e67e22" },
              userData.ownerStatus === "approved" && { color: "#27ae60" },
              userData.ownerStatus === "rejected" && { color: "#c0392b" },
            ]}
          >
            Status: {userData.ownerStatus}
          </Text>
        </View>
      )}

      {/* RESUBMIT BUTTON */}
      {userData.ownerStatus === "rejected" && (
        <TouchableOpacity style={styles.resubmitBtn} onPress={handleResubmit}>
          <Text style={styles.btnText}>Resubmit Request</Text>
        </TouchableOpacity>
      )}

      {/* SUPPORT SECTION (DROPDOWN) */}
      <TouchableOpacity style={styles.supportHeader} onPress={toggleSupport}>
        <Text style={styles.supportTitle}>Support</Text>
      </TouchableOpacity>

      {supportOpen && (
        <View style={styles.supportContent}>
          <Text style={styles.supportItem}>Phone: +383 45 123 456</Text>
          <Text style={styles.supportItem}>Email: support@parkeasy.com</Text>
        </View>
      )}

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.btnText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

//
// STYLES
//
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: { flex: 1, backgroundColor: "#E9F8F6", padding: 20 },

  title: { fontSize: 26, fontWeight: "bold", color: "#2E7D6A", marginBottom: 20 },

  box: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderColor: "#CDEDE7",
    borderWidth: 1,
    marginBottom: 16,
  },

  boxTitle: { fontSize: 18, fontWeight: "700", color: "#2E7D6A", marginBottom: 10 },

  item: { fontSize: 15, color: "#444", marginBottom: 5 },

  status: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
  },

  resubmitBtn: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },

  btnText: { color: "#fff", fontWeight: "600" },

  supportHeader: {
    padding: 12,
    backgroundColor: "#2E7D6A",
    borderRadius: 10,
    marginBottom: 6,
  },

  supportTitle: { color: "#fff", fontWeight: "700", textAlign: "center" },

  supportContent: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#CDEDE7",
    borderWidth: 1,
    marginBottom: 16,
  },

  supportItem: { fontSize: 15, color: "#555", marginBottom: 6 },

  logoutBtn: {
    backgroundColor: "#2E7D6A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
