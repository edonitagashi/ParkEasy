import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Linking,
  LayoutAnimation,
  UIManager,
  InteractionManager,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import theme from '../../components/theme';
const { colors } = theme;

const USERS_KEY = "users";               
const CURRENT_USER_KEY = "currentUser";  


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
  const [theme, setTheme] = useState("light");

  const placeholder = require("../../assets/images/profile.jpg");

  async function loadAvatarFromFirestore() {
  try {
    // 1) Gjej userId nga Firebase ose nga AsyncStorage (fallback)
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

    // 2) Provo me lexu si avatarUri ose si image (si te profesoresha)
    const base64Img = data.avatarUri || data.image;
    if (!base64Img) return;

    // 3) vendos në state që të shfaqet në UI
    setAvatarUri(base64Img);

    // 4) sinkronizo CURRENT_USER_KEY
    const rawCur2 = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (rawCur2) {
      const me2 = JSON.parse(rawCur2);
      me2.avatarUri = base64Img;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me2));
    }

    // 5) sinkronizo USERS list
    const rawUsers2 = await AsyncStorage.getItem(USERS_KEY);
    const users2 = rawUsers2 ? JSON.parse(rawUsers2) : [];
    const idx2 = users2.findIndex((u) => u.id === userId);
    if (idx2 !== -1) {
      users2[idx2] = { ...users2[idx2], avatarUri: base64Img };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users2));
    }
  } catch (e) {
    console.log("loadAvatarFromFirestore error:", e);
  }
}


  useEffect(() => {
    // enable LayoutAnimation on Android
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    (async () => {
      try {
        // First check Firebase auth
        if (auth.currentUser) {
          // User is logged in with Firebase
          const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);

          if (raw) {
            // kemi currentUser në AsyncStorage
            const me = JSON.parse(raw);
            setFullName(me.name || "User");
            setPhoneNumber(me.phone || "");
            setEmail(me.email || "");
            setPassword(me.password || "");
            setAvatarUri(me.avatarUri || null);
          } else {
            // Firebase user exists but no AsyncStorage data, create it
            const rawUsers = await AsyncStorage.getItem(USERS_KEY);
            const users = rawUsers ? JSON.parse(rawUsers) : [];
            const foundUser = users.find(
              (u) =>
                u.email?.toLowerCase() ===
                auth.currentUser.email?.toLowerCase()
            );

            if (foundUser) {
              await AsyncStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(foundUser)
              );
              setFullName(foundUser.name || "User");
              setPhoneNumber(foundUser.phone || "");
              setEmail(foundUser.email || "");
              setPassword(foundUser.password || "");
              setAvatarUri(foundUser.avatarUri || null);
            } else {
              // Create new user entry
              const newUser = {
                id: auth.currentUser.uid,
                name: auth.currentUser.displayName || "User",
                phone: "",
                email: auth.currentUser.email,
                password: "",
                avatarUri: "",
              };
              users.push(newUser);
              await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
              await AsyncStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(newUser)
              );
              setFullName(newUser.name);
              setEmail(newUser.email);
            }
          }

          // 🔹 pas gjithë logjikës lokale, ngarko avatarin nga Firestore pas animacioneve
          InteractionManager.runAfterInteractions(() => {
            loadAvatarFromFirestore();
          });
        } else {
          // No Firebase user, check AsyncStorage
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
        console.error("Profile read error:", e);
        Alert.alert("Error", "Profile data could not be read.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 ruan foton në Firestore si base64 (nën fushën avatarUri)
  const syncAvatarToFirestore = async (base64Img) => {
  try {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    const payload = {
      avatarUri: base64Img,
      image: base64Img,   // 🔹 përputhje me shembullin e profesoreshës
    };

    if (snap.exists()) {
      await updateDoc(userRef, payload);
    } else {
      await setDoc(userRef, payload, { merge: true });
    }

    console.log("Image synced to Firestore");
  } catch (error) {
    console.log("Firestore image error:", error);
  }
};

  const pickFromLibrary = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission required",
            "We need access to your photos."
          );
          return;
        }
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
        quality: 0.9,
      });

      if (!res.canceled && res.assets?.length) {
        const base64Img = `data:image/jpg;base64,${res.assets[0].base64}`;

        // në state (UI)
        setAvatarUri(base64Img);

        // në CURRENT_USER_KEY
        const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!rawCur) return;

        const me = JSON.parse(rawCur);
        me.avatarUri = base64Img;
        await AsyncStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify(me)
        );

        // në USERS
        const rawUsers = await AsyncStorage.getItem(USERS_KEY);
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        const idx = users.findIndex((u) => u.id === me.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], avatarUri: base64Img };
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        // në Firestore
        await syncAvatarToFirestore(base64Img);
      }
    } catch (e) {
      console.error("Image pick error:", e);
      Alert.alert("Error", "The photo could not be selected.");
    }
  };

  const takePhoto = async () => {
    try {
      // në web s'ka kamera reale
      if (Platform.OS === "web") {
        Alert.alert(
          "Not supported on web",
          "Camera works only on a physical device or emulator with Expo Go."
        );
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Permission to access camera is required!"
        );
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

        // state
        setAvatarUri(base64Img);

        // CURRENT_USER_KEY
        const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (rawCur) {
          const me = JSON.parse(rawCur);
          me.avatarUri = base64Img;
          await AsyncStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(me)
          );

          // USERS
          const rawUsers = await AsyncStorage.getItem(USERS_KEY);
          const users = rawUsers ? JSON.parse(rawUsers) : [];
          const idx = users.findIndex((u) => u.id === me.id);
          if (idx !== -1) {
            users[idx] = { ...users[idx], avatarUri: base64Img };
            await AsyncStorage.setItem(
              USERS_KEY,
              JSON.stringify(users)
            );
          }
        }

        // Firestore
        await syncAvatarToFirestore(base64Img);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "The photo could not be taken.");
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setAvatarUri(null);

      const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!rawCur) return;
      const me = JSON.parse(rawCur);
      delete me.avatarUri;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me));

      const rawUsers = await AsyncStorage.getItem(USERS_KEY);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const idx = users.findIndex((u) => u.id === me.id);
      if (idx !== -1) {
        const { avatarUri: _drop, ...rest } = users[idx];
        users[idx] = rest;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // (opsionale) fshije edhe nga Firestore duke i vendos avatarUri: ""
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { avatarUri: "" });
      }
    } catch (e) {
      console.log("handleRemovePhoto error:", e);
    }
  };
  
  const handleSave = async () => {
    if (saving) return;
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Error", "Please fill in Name, Phone, Email, and Password.");

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
      const idx = users.findIndex(u => u.id === me.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updated };
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      setSuccessMsg("✅ Changes saved succesfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error("Profile save error:", e);
      Alert.alert("Wrong", "No changes were saved.");
    } finally {
      setSaving(false);
    }
  };

  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch {}
    router.replace("/"); // te hyrja
  };

  
  const handleAboutUs = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAboutPanel(v => !v);
  };

  const handleHelp = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowHelpPanel(v => !v);
  };

  const handlePrivacyPolicy = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPrivacyPanel(v => !v);
  };

  const handleTermsOfService = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowTermsPanel(v => !v);

  };

  if (loading) {
    return (
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#EAEAEA' }} />
        </View>
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={{ height: 18, width: '50%', backgroundColor: '#EAEAEA', borderRadius: 8, marginBottom: 12 }} />
          <View style={{ height: 16, width: '70%', backgroundColor: '#EAEAEA', borderRadius: 8 }} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Avatar + Add/Change Photo */}
      <View style={s.avatarWrap}>
  <Image
    source={avatarUri ? { uri: avatarUri } : placeholder}
    style={s.avatar}
  />

  {/* Butonat horizontal: Add + Take */}
  <View style={s.photoButtonsRow}>
    <TouchableOpacity style={s.addPhotoBtn} onPress={pickFromLibrary}>
      <Text style={s.addPhotoTxt}>
        {avatarUri ? "Change photo" : "Add photo"}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={s.addPhotoBtn} onPress={takePhoto}>
      <Text style={s.addPhotoTxt}>Take photo</Text>
    </TouchableOpacity>
  </View>

  {/* Remove photo poshtë tyre */}
  {avatarUri ? (
    <TouchableOpacity
      style={[s.addPhotoBtn, s.removePhotoBtn]}
      onPress={handleRemovePhoto}
    >
      <Text style={[s.addPhotoTxt, { color: "#b02a37" }]}>Remove photo</Text>
    </TouchableOpacity>
  ) : null}
</View>


      <Text style={s.fullname}>{fullName || "User"}</Text>

      <Text style={s.section}>Edit profile</Text>

      {/* Emri */}
      <View style={s.row}>
        <Text style={s.label}>Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your name"
          style={s.input}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </View>

      {/* Numri */}
      <View style={s.row}>
        <Text style={s.label}>Phone Number</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"          
          keyboardType="phone-pad"
          inputMode="tel"
          style={s.input}
          autoCorrect={false}
        />
      </View>

      {/* Email */}
      <View style={s.row}>
        <Text style={s.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
          inputMode="email"
          style={s.input}
          autoCorrect={false}
        />
      </View>

      {/* Password + Show/Hide */}
      <View style={[s.row, { position: "relative" }]}>
        <Text style={s.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPwd}
          style={[s.input, { paddingRight: 64 }]}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={s.showBtn}>
          <Text style={s.showTxt}>{showPwd ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
        <Text style={s.saveTxt}>{saving ? "Saving..." : "Save changes"}</Text>
      </TouchableOpacity>

      {/* ✅ Mesazhi i suksesit poshtë butonit */}
      {successMsg ? <Text style={s.successMsg}>{successMsg}</Text> : null}

      {/* SEKSIONI I RI: Opsione të tjera */}
      <Text style={s.section}>More Options</Text>

      {/* About Us */}
      <TouchableOpacity style={s.optionItem} onPress={handleAboutUs}>
        <View style={s.optionLeft}>
          <Ionicons name="information-circle" size={24} color="#4C6E64" />
          <Text style={s.optionText}>About Us</Text>
        </View>
        <Ionicons name={showAboutPanel ? "chevron-down" : "chevron-forward"} size={20} color="#4C6E64" />
      </TouchableOpacity>

      {showAboutPanel && (
        <View style={s.expandedPanel}>
          <ScrollView style={s.panelScroll} nestedScrollEnabled={true}>
            <Text style={s.expandedText}>ParkEasy v1.0.0 — A modern app for finding parking. Developed with ❤️ in Kosovo. Contact: info@parkeasy.com</Text>
          </ScrollView>
        </View>
      )}

      {/* Help & Support */}
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

      {/* Privacy Policy */}
      <TouchableOpacity style={s.optionItem} onPress={handlePrivacyPolicy}>
        <View style={s.optionLeft}>
          <Ionicons name="shield-checkmark" size={24} color="#4C6E64" />
          <Text style={s.optionText}>Privacy Policy</Text>
        </View>
        <Ionicons name={showPrivacyPanel ? "chevron-down" : "chevron-forward"} size={20} color="#4C6E64" />
      </TouchableOpacity>

      {showPrivacyPanel && (
        <View style={s.expandedPanel}>
          <ScrollView style={s.panelScroll} nestedScrollEnabled={true}>
            <Text style={s.expandedText}>We respect your privacy. Your data is secure and used only for service purposes. We do not share personal data without consent.</Text>
          </ScrollView>
        </View>
      )}

      {/* Terms of Service */}
      <TouchableOpacity style={s.optionItem} onPress={handleTermsOfService}>
        <View style={s.optionLeft}>
          <Ionicons name="document-text" size={24} color="#4C6E64" />
          <Text style={s.optionText}>Terms of Service</Text>
        </View>
        <Ionicons name={showTermsPanel ? "chevron-down" : "chevron-forward"} size={20} color="#4C6E64" />
      </TouchableOpacity>

      {showTermsPanel && (
        <View style={s.expandedPanel}>
          <ScrollView style={s.panelScroll} nestedScrollEnabled={true}>
            <Text style={s.expandedText}>By using ParkEasy, you agree to our terms of service. Use the app responsibly and follow local parking rules.</Text>
          </ScrollView>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <View style={s.optionLeft}>
          <Ionicons name="log-out" size={24} color="#b02a37" />
          <Text style={[s.optionText, { color: "#b02a37" }]}>Logout</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#b02a37" />
      </TouchableOpacity>

      {/* Version Info */}
      <View style={s.versionContainer}>
        <Text style={s.versionText}>ParkEasy v1.0.0</Text>
        <Text style={s.copyright}>© 2024 ParkEasy. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#E9F8F6", padding:20 },

  avatarWrap:{ 
    alignItems:"center", 
    marginTop:8, 
    marginBottom:6 
  },

  avatar:{ 
    width:96, 
    height:96, 
    borderRadius:48, 
    backgroundColor:"#d9ebe7" 
  },

  // 🔹 RRESHTI HORIZONTAL I BUTONAVE (Add + Take)
  photoButtonsRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "center",
    columnGap: 10,        // nëse s’punon, përdor vetëm marginHorizontal te butonat
  },

  // 🔹 BUTONI BAZË (Add, Take, Remove)
  addPhotoBtn:{
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:999,
    borderWidth:2,
    borderColor:"#2E7D6A",
    marginHorizontal: 4,
  },

  // 🔹 VARIANTI REMOVE PHOTO
  removePhotoBtn: {
    marginTop: 8,
    borderColor: "#b02a37",
  },

  addPhotoTxt:{ color:"#2E7D6A", fontWeight:"700" },

  fullname:{ 
    textAlign:"center", 
    fontSize:18, 
    fontWeight:"700", 
    color:"#2E7D6A", 
    marginBottom:10 
  },

  section:{ 
    color:"#4C6E64", 
    fontWeight:"700", 
    marginBottom:8, 
    marginTop: 16 
  },

  row:{ 
    backgroundColor:colors.surface, 
    borderWidth:1, 
    borderColor:"#CFE1DB", 
    borderRadius:12, 
    padding:12, 
    marginBottom:10 
  },

  label:{ 
    color:"#4C6E64", 
    marginBottom:6, 
    fontWeight:"600" 
  },

  input:{ 
    fontSize:16, 
    color:"#1b1b1b" 
  },

  showBtn:{ 
    position:"absolute", 
    right:12, 
    bottom:12, 
    paddingVertical:6, 
    paddingHorizontal:8, 
    borderRadius:8 
  },

  showTxt:{ 
    color:"#2E7D6A", 
    fontWeight:"700" 
  },

  saveBtn:{ 
    backgroundColor:"#2E7D6A", 
    borderRadius:12, 
    alignItems:"center", 
    paddingVertical:12, 
    marginTop:4 
  },

  saveTxt:{ 
    color:colors.textOnPrimary, 
    fontWeight:"700" 
  },
  
  successMsg:{
    color:"#2E7D6A",
    backgroundColor:"#DFF6E3",
    textAlign:"center",
    paddingVertical:8,
    marginTop:10,
    borderRadius:8,
    fontWeight:"700",
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CFE1DB',
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionText: {
    fontSize: 16,
    color: '#1b1b1b',
    marginLeft: 12,
    fontWeight: '500',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#b02a37',
  },

  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    padding: 16,
  },

  versionText: {
    color: '#4C6E64',
    fontSize: 14,
    fontWeight: '600',
  },

  copyright: {
    color: '#4C6E64',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },

  expandedPanel: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFE1DB',
    marginBottom: 8,
  },

  panelScroll: {
    maxHeight: 220,
  },

  expandedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4C6E64',
  },

  expandedText: {
    fontSize: 14,
    color: '#1b1b1b',
    marginTop: 6,
  },

  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F8F7',
    borderWidth: 1,
    borderColor: '#CFE1DB',
  },

  smallBtnActive: {
    backgroundColor: '#2E7D6A',
  },

  smallBtnText: {
    color: '#1b1b1b',
    fontWeight: '600',
  },
});
