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
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme, { colors } from "../../components/theme";
import { auth, db } from "../../firebase/firebase";
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
  
  // Edit profile states
  const [editVisible, setEditVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const CURRENT_USER_KEY = "currentUser";

  const formatKosovoPhone = (text) => {
    try {
      const digits = String(text || "").replace(/\D+/g, "");
      let rest = digits;
      if (rest.startsWith("383")) rest = rest.slice(3);
      rest = rest.slice(0, 8);
      const p1 = rest.slice(0, 2);
      const p2 = rest.slice(2, 5);
      const p3 = rest.slice(5, 8);
      let out = "+383 ";
      if (p1) out += p1;
      if (p2) out += ` ${p2}`;
      if (p3) out += ` ${p3}`;
      return out;
    } catch {
      return "+383 ";
    }
  };

  const handlePhoneChange = (text) => {
    setPhoneNumber(formatKosovoPhone(text));
  };

  const toggleSupport = () => {
    LayoutAnimation.easeInEaseOut();
    setSupportOpen(!supportOpen);
  };


  const handleSave = async () => {
    if (saving) return;
    if (
      !fullName.trim() ||
      !phoneNumber.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return Alert.alert(
        "Error",
        "Please fill in Name, Phone, Email, and Password."
      );
    }
    setSaving(true);
    try {
      const updated = {
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      await updateDoc(doc(db, "users", user.uid), updated);

      const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (rawCur) {
        const me = JSON.parse(rawCur);
        Object.assign(me, updated);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me));
      }

      setSuccessMsg("✅ Changes saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setEditVisible(false);
      loadData();
    } catch (e) {
      console.error("Profile save error:", e);
      Alert.alert("Error", "No changes were saved.");
    } finally {
      setSaving(false);
    }
  };

  const loadData = async () => {
    const uRef = await getDoc(doc(db, "users", user.uid));
    const u = uRef.data();
    setUserData(u);
    
    // Set profile edit fields
    setFullName(u.name || "");
    setPhoneNumber(formatKosovoPhone(u.phone || ""));
    setEmail(u.email || "");
    setPassword(u.password || "");

    if (u.ownerRequestId) {
      const rRef = await getDoc(doc(db, "ownerRequests", u.ownerRequestId));
      setRequestData(rRef.data());
    }

    setLoading(false);
  };

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }
        await loadData();
      } catch (e) {
        console.error("Owner profile init error:", e);
        setLoading(false);
      }
    })();
  }, []);

  // Safe stubs to avoid undefined handler errors
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear local cached user if present
      try { await AsyncStorage.removeItem(CURRENT_USER_KEY); } catch {}
      // Navigate to Login screen and replace history
      router.replace('/(auth)/LoginScreen');
    } catch (e) {
      console.error("Logout error:", e);
      Alert.alert("Error", "Could not log out.");
    }
  };

  const handleResubmit = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'No authenticated user.');
        return;
      }
      if (userData?.ownerStatus === 'pending') {
        Alert.alert('Already Pending', 'Your request is already pending review.');
        return;
      }

      const basePayload = {
        userId: auth.currentUser.uid,
        parkingName: requestData?.parkingName ?? '',
        address: requestData?.address ?? '',
        price: requestData?.price ?? 0,
        totalSpots: requestData?.totalSpots ?? 0,
        status: 'pending',
        submittedAt: serverTimestamp(),
      };

      const reqRef = await addDoc(collection(db, 'ownerRequests'), basePayload);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ownerStatus: 'pending',
        ownerRequestId: reqRef.id,
      });

      setRequestData({ ...basePayload });
      setUserData(prev => ({ ...(prev || {}), ownerStatus: 'pending', ownerRequestId: reqRef.id }));
      Alert.alert('Resubmitted', 'Your request has been resubmitted and is pending review.');
      await loadData();
    } catch (e) {
      console.error("Resubmit error:", e);
      Alert.alert('Error', 'Could not resubmit your request.');
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.fullname}>{fullName || "Owner"}</Text>
          <Text style={styles.userLabel}>Owner Account</Text>
        </View>

        {/* Edit Profile Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Edit profile</Text>
          
          {/* Name Field */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              style={styles.fieldInput}
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.divider} />
          
          {/* Phone Number Field */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="+383 00 000 000"
              style={styles.fieldInput}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
          
          <View style={styles.divider} />
          
          {/* Email Field */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@gmail.com"
              style={styles.fieldInput}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.sectionCard}>
          <View style={[styles.fieldRow, { position: "relative" }]}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPwd}
              style={[styles.fieldInput, { paddingRight: 64 }]}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.showBtn}>
              <Text style={styles.showTxt}>{showPwd ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleSave} 
          disabled={saving}
        >
          <Text style={styles.saveTxt}>{saving ? "Saving..." : "Save changes"}</Text>
        </TouchableOpacity>

        {/* Success Message */}
        {successMsg ? <Text style={styles.successMsg}>{successMsg}</Text> : null}

        {/* PARKING INFO Section */}
        <Text style={styles.section}>Parking Information</Text>
        {requestData && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{requestData.parkingName}</Text>
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
      </ScrollView>

      
    </View>
  );
}

//
// STYLES
//
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: { 
    flex: 1, 
    backgroundColor: "#E9F8F6" 
  },

  // Profile Header Styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },

  

  fullname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },

  userLabel: {
    fontSize: 16,
    color: '#666666',
  },

  // Edit Profile Card
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: '#CFE1DB',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C6E64',
    marginBottom: 16,
  },

  fieldRow: {
    paddingVertical: 12,
  },

  fieldLabel: {
    fontSize: 14,
    color: '#4C6E64',
    marginBottom: 6,
    fontWeight: '600',
  },

  fieldInput: {
    fontSize: 16,
    color: '#1b1b1b',
    paddingVertical: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#CFE1DB',
  },

  // Password field specific
  showBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  showTxt: {
    color: "#2E7D6A",
    fontWeight: "700",
  },

  // Save Button
  saveBtn: {
    backgroundColor: "#2E7D6A",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },

  saveTxt: {
    color: colors.textOnPrimary,
    fontWeight: "700",
    fontSize: 16,
  },

  successMsg: {
    color: "#2E7D6A",
    backgroundColor: "#DFF6E3",
    textAlign: "center",
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 8,
    fontWeight: "700",
  },

  section: {
    color: "#4C6E64",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 16,
    fontSize: 18,
  },

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
    marginHorizontal: 16,
  },

  btnText: { color: colors.textOnPrimary, fontWeight: "600" },

  supportHeader: {
    padding: theme.spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginBottom: theme.spacing.sm - theme.spacing.xs,
    marginHorizontal: 16,
  },

  supportTitle: { color: colors.textOnPrimary, fontWeight: "700", textAlign: "center" },

  supportContent: {
    padding: theme.spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
    marginHorizontal: 16,
  },

  supportItem: { fontSize: 15, color: colors.textMuted, marginBottom: theme.spacing.sm - theme.spacing.xs },

  logoutBtn: {
    backgroundColor: colors.primary,
    padding: theme.spacing.md,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
  },

  
});
