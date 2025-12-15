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
import theme, { colors } from "../../components/theme";
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
        <ActivityIndicator size="large" color={colors.primary} />
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
              userData.ownerStatus === "pending" && { color: colors.warning },
              userData.ownerStatus === "approved" && { color: colors.success },
              userData.ownerStatus === "rejected" && { color: colors.danger },
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

  container: { flex: 1, backgroundColor: colors.background, padding: theme.spacing.lg + theme.spacing.sm },

  title: { fontSize: 26, fontWeight: "bold", color: colors.primary, marginBottom: theme.spacing.xl - theme.spacing.sm },

  box: {
    backgroundColor: colors.surface,
    padding: theme.spacing.md + theme.spacing.xs,
    borderRadius: 12,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },

  boxTitle: { fontSize: 18, fontWeight: "700", color: colors.primary, marginBottom: theme.spacing.sm + theme.spacing.xs },

  item: { fontSize: 15, color: colors.text, marginBottom: theme.spacing.sm - theme.spacing.xs },

  status: {
    marginTop: theme.spacing.md - 2,
    fontSize: 16,
    fontWeight: "700",
  },

  resubmitBtn: {
    backgroundColor: colors.danger,
    padding: theme.spacing.md,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },

  btnText: { color: colors.textOnPrimary, fontWeight: "600" },

  supportHeader: {
    padding: theme.spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginBottom: theme.spacing.sm - theme.spacing.xs,
  },

  supportTitle: { color: colors.textOnPrimary, fontWeight: "700", textAlign: "center" },

  supportContent: {
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },

  supportItem: { fontSize: 15, color: colors.textMuted, marginBottom: theme.spacing.sm - theme.spacing.xs },

  logoutBtn: {
    backgroundColor: colors.primary,
    padding: theme.spacing.md,
    borderRadius: 10,
    alignItems: "center",
  },
});
