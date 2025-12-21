import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
  LayoutAnimation,
  ActivityIndicator,
  UIManager,
  Platform,
  InteractionManager,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import theme from "../hooks/theme";
import SearchHeader from "../../components/SearchHeader"; 

const { colors } = theme;

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

const placeholder = require("../../assets/images/profile.jpg");

export default function Profile() {
  const router = useRouter();

  const [fullName, setFullName] = useState("User");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [showAboutPanel, setShowAboutPanel] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [showTermsPanel, setShowTermsPanel] = useState(false);

  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

// Kosovo phone formatter: +383 00 000 000
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

async function loadAvatarFromFirestore() {
    try {
      let userId = auth.currentUser?.uid;
      if (!userId) {
        const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!rawCur) return;
        const me = JSON.parse(rawCur);
        if (!me.id) return;
        userId = me.id;
      }
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const base64Img = data.avatarUri || data.image || data.avatarUrl;
      if (!base64Img) return;
      setAvatarUri(base64Img);

      const rawCur2 = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (rawCur2) {
        const me2 = JSON.parse(rawCur2);
        me2.avatarUri = base64Img;
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me2));
      }
    } catch (e) {
      console.log("loadAvatarFromFirestore error:", e);
    }
  }

const syncAvatarToFirestore = async (base64Img) => {
    try {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      const payload = { avatarUri: base64Img, image: base64Img };
      if (snap.exists()) {
        await updateDoc(userRef, payload);
      } else {
        await setDoc(userRef, payload, { merge: true });
      }
    } catch (error) {
      console.log("Firestore image error:", error);
    }
  };

  const pickFromLibrary = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "We need access to your photos.");
          return;
        }
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        quality: 0.3,
      });
      if (!res.canceled && res.assets?.length) {
        const base64Img = `data:image/jpg;base64,${res.assets[0].base64}`;
        await handleAvatarUpdate(base64Img);
      }
    } catch (e) {
      Alert.alert("Error", "The photo could not be selected.");
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("Not supported on web", "Camera works only on a physical device or emulator with Expo Go.");
        return;
      }
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Permission to access camera is required!");
        return;
      }
      const results = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        quality: 0.5,
      });
      if (!results.canceled && results.assets?.length) {
        const base64Img = `data:image/jpg;base64,${results.assets[0].base64}`;
        await handleAvatarUpdate(base64Img);
      }
    } catch (error) {
      Alert.alert("Error", "The photo could not be taken.");
    }
  };

  const handleAvatarUpdate = async (base64Img) => {
    setAvatarUri(base64Img);
    const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!rawCur) return;
    const me = JSON.parse(rawCur);
    me.avatarUri = base64Img;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me));

    const rawUsers = await AsyncStorage.getItem(USERS_KEY);
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const idx = users.findIndex((u) => u.id === me.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], avatarUri: base64Img };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    await syncAvatarToFirestore(base64Img);
  };

  const handleRemovePhoto = async () => {
    try {
      setAvatarUri(null);
      const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!rawCur) return;
      const me = JSON.parse(rawCur);
      delete me.avatarUri;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me));

      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { avatarUri: "" });
      }
    } catch (e) {
      console.log("handleRemovePhoto error:", e);
    }
  };

  // ==================== LOAD DATA ====================
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    (async () => {
      try {
        if (auth.currentUser) {
          const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
          if (raw) {
            const me = JSON.parse(raw);
            setFullName(me.name || "User");
            setPhoneNumber(me.phone || "");
            setEmail(me.email || "");
            setPassword(me.password || "");
            setAvatarUri(me.avatarUri || null);
          } else {
            // ... (kodi për gjetjen e përdoruesit nga AsyncStorage kur nuk ka auth – mbetet i njëjtë)
          }
          InteractionManager.runAfterInteractions(() => {
            loadAvatarFromFirestore();
          });
        } else {
          const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
          if (!raw) {
            Alert.alert("Session expired", "Please log in to view your profile.");
            router.replace("/");
            return;
          }
          const me = JSON.parse(raw);
          setFullName(me.name || "User");
          setPhoneNumber(me.phone || "");
          setEmail(me.email || "");
          setPassword(me.password || "");
          setAvatarUri(me.avatarUri || null);
        }
      } catch (e) {
        Alert.alert("Error", "Profile data could not be read.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ==================== SAVE & LOGOUT ====================
  const handleSave = async () => {
    if (saving) return;
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Error", "Please fill in all fields.");
    }
    setSaving(true);
    try {
      const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!rawCur) {
        Alert.alert("Session expired", "Please log in again.");
        router.replace("/LoginScreen");
        return;
      }
      const me = JSON.parse(rawCur);
      const updated = {
        ...me,
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatarUri: avatarUri ?? "",
      };
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

      const rawUsers = await AsyncStorage.getItem(USERS_KEY);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const idx = users.findIndex((u) => u.id === me.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updated };
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // SAVE TO FIRESTORE
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(
          userRef,
          {
            name: fullName.trim(),
            phone: phoneNumber.trim(),
            email: email.trim().toLowerCase(),
            avatarUri: avatarUri ?? "",
          },
          { merge: true }
        );
      }

      setSuccessMsg("✅ Changes saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      Alert.alert("Error", "No changes were saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch {}
    router.replace("/");
  };

  const handleAboutUs = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAboutPanel((v) => !v);
  };

  const handleHelp = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowHelpPanel((v) => !v);
  };

  const handlePrivacyPolicy = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPrivacyPanel((v) => !v);
  };

  const handleTermsOfService = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowTermsPanel((v) => !v);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#E9F8F6", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D6A" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#E9F8F6" }}>
      {/* HEADER ME TITULL DHE ZILJË */}
      <SearchHeader
        title="Profile"
        onNotificationPress={() => router.push("/notification")}
      />

<ScrollView
  style={{ flex: 1 }}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingTop: 20 }}
>
        {/* AVATARI DHE EMRII */}
        <View style={s.profileTop}>
          <TouchableOpacity
            style={s.avatarContainer}
            onPress={() => setShowPhotoOptions(true)}
          >
            <Image
              source={avatarUri ? { uri: avatarUri } : placeholder}
              style={s.avatar}
            />
            <View style={s.editAvatarButton}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={s.fullname}>{fullName || "User"}</Text>
          <Text style={s.userLabel}>User</Text>
        </View>

        {/* KARTELA E VETME PËR TË GJITHA FUSHAT (përfshirë Password) */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>Edit profile</Text>

          {/* Name */}
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              style={s.fieldInput}
              placeholderTextColor="#999"
            />
          </View>
          <View style={s.divider} />

          {/* Phone */}
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              style={s.fieldInput}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
          <View style={s.divider} />

          {/* Email */}
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              style={s.fieldInput}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={s.divider} />

          {/* Password – tani brenda së njëjtës kartelë */}
          <View style={[s.fieldRow, { position: "relative" }]}>
            <Text style={s.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPwd}
              style={[s.fieldInput, { paddingRight: 64 }]}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={s.showBtn}>
              <Text style={s.showTxt}>{showPwd ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveTxt}>{saving ? "Saving..." : "Save changes"}</Text>
        </TouchableOpacity>

        {successMsg ? <Text style={s.successMsg}>{successMsg}</Text> : null}

        {/* MORE OPTIONS – mbeten siç ishin */}
        <Text style={s.section}>More Options</Text>

        <TouchableOpacity style={s.optionItem} onPress={handleAboutUs}>
          <View style={s.optionLeft}>
            <Ionicons name="information-circle" size={24} color="#4C6E64" />
            <Text style={s.optionText}>About Us</Text>
          </View>
          <Ionicons name={showAboutPanel ? "chevron-down" : "chevron-forward"} size={20} color="#4C6E64" />
        </TouchableOpacity>
        {showAboutPanel && (
          <View style={s.expandedPanel}>
            <Text style={s.expandedText}>ParkEasy v1.0.0 — A modern app for finding parking. Developed with ❤️ in Kosovo. Contact: info@parkeasy.com</Text>
          </View>
        )}

        <TouchableOpacity style={s.optionItem} onPress={handleHelp}>
          <View style={s.optionLeft}>
            <Ionicons name="help-circle" size={24} color="#4C6E64" />
            <Text style={s.optionText}>Help & Support</Text>
          </View>
          <Ionicons name={showHelpPanel ? "chevron-down" : "chevron-forward"} size={20} color="#4C6E64" />
        </TouchableOpacity>
        {showHelpPanel && (
          <View style={s.expandedPanel}>
            <ScrollView style={s.panelScroll} nestedScrollEnabled={true}>
              <Text style={s.expandedLabel}>Contact</Text>
              <Text style={s.expandedText}>Phone: +383 49 000 000</Text>
              <Text style={s.expandedText}>Email: support@parkeasy.com</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TouchableOpacity style={s.smallBtn} onPress={() => Linking.openURL('tel:+38349000000')}>
                  <Text style={s.smallBtnText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.smallBtn} onPress={() => Linking.openURL('mailto:support@parkeasy.com')}>
                  <Text style={s.smallBtnText}>Email</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}

        <TouchableOpacity style={s.optionItem} onPress={handlePrivacyPolicy}>
          <View style={s.optionLeft}>
            <Ionicons name="shield-checkmark" size={24} color="#4C6E64" />
            <Text style={s.optionText}>Privacy Policy</Text>
          </View>
          <Ionicons name={showPrivacyPanel ? "chevron-down" : "chevron-forward"} size={20} color="#4C6E64" />
        </TouchableOpacity>
        {showPrivacyPanel && (
          <View style={s.expandedPanel}>
            <Text style={s.expandedText}>We respect your privacy. Your data is secure and used only for service purposes.</Text>
          </View>
        )}

        <TouchableOpacity style={s.optionItem} onPress={handleTermsOfService}>
          <View style={s.optionLeft}>
            <Ionicons name="document-text" size={24} color="#4C6E64" />
            <Text style={s.optionText}>Terms of Service</Text>
          </View>
          <Ionicons name={showTermsPanel ? "chevron-down" : "chevron-forward"} size={20} color="#4C6E64" />
        </TouchableOpacity>
        {showTermsPanel && (
          <View style={s.expandedPanel}>
            <Text style={s.expandedText}>By using ParkEasy, you agree to our terms of service.</Text>
          </View>
        )}

        {/* LOGOUT */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <View style={s.optionLeft}>
            <Ionicons name="log-out" size={24} color="#b02a37" />
            <Text style={[s.optionText, { color: "#b02a37" }]}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#b02a37" />
        </TouchableOpacity>

        {/* VERSION */}
        <View style={s.versionContainer}>
          <Text style={s.versionText}>ParkEasy v1.0.0</Text>
          <Text style={s.copyright}>© 2024 ParkEasy. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* PHOTO OPTIONS BOTTOM SHEET */}
      {showPhotoOptions && (
        <View style={s.bottomSheetOverlay}>
          <TouchableOpacity
            style={s.bottomSheetBackground}
            activeOpacity={1}
            onPress={() => setShowPhotoOptions(false)}
          />
          <View style={s.bottomSheetContent}>
            <TouchableOpacity style={s.modalOption} onPress={() => { setShowPhotoOptions(false); InteractionManager.runAfterInteractions(pickFromLibrary); }}>
              <Ionicons name="image" size={24} color="#4C6E64" />
              <Text style={s.modalOptionText}>Choose from library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.modalOption} onPress={() => { setShowPhotoOptions(false); InteractionManager.runAfterInteractions(takePhoto); }}>
              <Ionicons name="camera" size={24} color="#4C6E64" />
              <Text style={s.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            {avatarUri && (
              <TouchableOpacity style={[s.modalOption, s.deleteOption]} onPress={() => { setShowPhotoOptions(false); InteractionManager.runAfterInteractions(handleRemovePhoto); }}>
                <Ionicons name="trash" size={24} color="#b02a37" />
                <Text style={[s.modalOptionText, s.deleteOptionText]}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[s.modalOption, s.cancelOption]} onPress={() => setShowPhotoOptions(false)}>
              <Text style={s.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ==================== STYLES ====================
const s = StyleSheet.create({
  profileTop: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#d9ebe7",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2E7D6A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  fullname: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 16,
    color: "#666666",
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: "#CFE1DB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4C6E64",
    marginBottom: 16,
  },
  fieldRow: {
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#4C6E64",
    marginBottom: 6,
    fontWeight: "600",
  },
  fieldInput: {
    fontSize: 16,
    color: "#1b1b1b",
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#CFE1DB",
  },
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
  saveBtn: {
    backgroundColor: "#2E7D6A",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
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
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CFE1DB",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#1b1b1b",
    marginLeft: 12,
    fontWeight: "500",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#b02a37",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  versionText: {
    color: "#4C6E64",
    fontSize: 14,
    fontWeight: "600",
  },
  copyright: {
    color: "#4C6E64",
    fontSize: 12,
    marginTop: 5,
  },
  expandedPanel: {
    backgroundColor: colors.surface,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CFE1DB",
    marginBottom: 8,
  },
  panelScroll: {
    maxHeight: 220,
  },
  expandedLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4C6E64",
  },
  expandedText: {
    fontSize: 14,
    color: "#1b1b1b",
    marginTop: 6,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F8F7",
    borderWidth: 1,
    borderColor: "#CFE1DB",
  },
  smallBtnText: {
    color: "#1b1b1b",
    fontWeight: "600",
  },
  bottomSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  bottomSheetBackground: {
    flex: 1,
  },
  bottomSheetContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 4,
    paddingTop: 6,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  deleteOption: {
    borderBottomColor: "#F5F5F5",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
    fontWeight: "500",
  },
  deleteOptionText: {
    color: "#b02a37",
    fontWeight: "600",
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingVertical: 8,
    justifyContent: "center",
  },
  cancelOptionText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    fontWeight: "600",
  },
});