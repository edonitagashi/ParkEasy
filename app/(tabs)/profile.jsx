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
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from '@expo/vector-icons';

const USERS_KEY = "users";               
const CURRENT_USER_KEY = "currentUser";  

export default function Profile() {
  const router = useRouter();

  const [fullName, setFullName]       = useState("User");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPwd, setShowPwd]         = useState(false);

  const [avatarUri, setAvatarUri]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  const [successMsg, setSuccessMsg]   = useState("");

  const placeholder = require("../../assets/images/profile.jpg");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!raw) {
          Alert.alert("Session expired", "Please log in to view your profile.");
          router.replace("/LoginScreen");
          return;
        }
        const me = JSON.parse(raw);
        setFullName(me.name || "User");
        setPhoneNumber(me.phone || "");
        setEmail(me.email || "");
        setPassword(me.password || "");
        setAvatarUri(me.avatarUri || null);
      } catch (e) {
        console.error("Profile read error:", e);
        Alert.alert("Error", "Profile data could not be read.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!res.canceled && res.assets?.length) {
        const uri = res.assets[0].uri;
        setAvatarUri(uri);

        const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!rawCur) return;
        const me = JSON.parse(rawCur);
        me.avatarUri = uri;
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(me));

        const rawUsers = await AsyncStorage.getItem(USERS_KEY);
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        const idx = users.findIndex(u => u.id === me.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], avatarUri: uri };
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      }
    } catch (e) {
      console.error("Image pick error:", e);
      Alert.alert("Error", "The photo could not be selected.");
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
      const idx = users.findIndex(u => u.id === me.id);
      if (idx !== -1) {
        const { avatarUri: _drop, ...rest } = users[idx];
        users[idx] = rest;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    } catch {}
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

  
  const handleSettings = () => {
Alert.alert("Settings", "Settings will be added in the next version!");
  };

  const handleAboutUs = () => {
   Alert.alert(
  "About ParkEasy",
  `ParkEasy v1.0.0\n\nA modern app for finding parking.\n\nDeveloped with ❤️ in Kosovo\n\nContact: info@parkeasy.com`
);
  };

  const handleHelp = () => {
    Alert.alert(
  "Help & Support",
  "Need help?\n\n• Contact: +383 49 000 000\n• Email: support@parkeasy.com\n• Hours: 08:00 - 20:00",
  [
    { text: "Cancel", style: "cancel" },
    { text: "Call Support", onPress: () => Linking.openURL('tel:+38349000000') },
    { text: "Email Support", onPress: () => Linking.openURL('mailto:support@parkeasy.com') }
  ]
);
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
  "Privacy Policy",
  "We respect your privacy. Your data is secure and used only for service purposes.",
  [{ text: "OK", style: "default" }]
);
  };

  const handleTermsOfService = () => {
    Alert.alert(
  "Terms of Service",
  "By using ParkEasy, you agree to our terms of service. Read the full document on our website.",
  [{ text: "OK", style: "default" }]
);

  };

  if (loading) {
    return (
      <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#4C6E64" }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Avatar + Add/Change Photo */}
      <View style={s.avatarWrap}>
        <Image source={avatarUri ? { uri: avatarUri } : placeholder} style={s.avatar} />
        <TouchableOpacity style={s.addPhotoBtn} onPress={pickFromLibrary}>
          <Text style={s.addPhotoTxt}>{avatarUri ? "Change photo" : "Add photo"}</Text>
        </TouchableOpacity>

        {avatarUri ? (
          <TouchableOpacity
            style={[s.addPhotoBtn, { marginTop: 6, borderColor: "#b02a37" }]}
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

      {/* Settings */}
      <TouchableOpacity style={s.optionItem} onPress={handleSettings}>
        <View style={s.optionLeft}>
          <Ionicons name="settings" size={24} color="#4C6E64" />
          <Text style={s.optionText}>Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4C6E64" />
      </TouchableOpacity>

      {/* About Us */}
      <TouchableOpacity style={s.optionItem} onPress={handleAboutUs}>
        <View style={s.optionLeft}>
          <Ionicons name="information-circle" size={24} color="#4C6E64" />
          <Text style={s.optionText}>About Us</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4C6E64" />
      </TouchableOpacity>

      {/* Help & Support */}
      <TouchableOpacity style={s.optionItem} onPress={handleHelp}>
        <View style={s.optionLeft}>
          <Ionicons name="help-circle" size={24} color="#4C6E64" />
          <Text style={s.optionText}>Help & Support</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4C6E64" />
      </TouchableOpacity>

      {/* Privacy Policy */}
      <TouchableOpacity style={s.optionItem} onPress={handlePrivacyPolicy}>
        <View style={s.optionLeft}>
          <Ionicons name="shield-checkmark" size={24} color="#4C6E64" />
          <Text style={s.optionText}>Privacy Policy</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4C6E64" />
      </TouchableOpacity>

      {/* Terms of Service */}
      <TouchableOpacity style={s.optionItem} onPress={handleTermsOfService}>
        <View style={s.optionLeft}>
          <Ionicons name="document-text" size={24} color="#4C6E64" />
          <Text style={s.optionText}>Terms of Service</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4C6E64" />
      </TouchableOpacity>

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
  avatarWrap:{ alignItems:"center", marginTop:8, marginBottom:6 },
  avatar:{ width:96, height:96, borderRadius:48, backgroundColor:"#d9ebe7" },
  addPhotoBtn:{
    marginTop:8,
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:999,
    borderWidth:2,
    borderColor:"#2E7D6A",
  },
  addPhotoTxt:{ color:"#2E7D6A", fontWeight:"700" },
  fullname:{ textAlign:"center", fontSize:18, fontWeight:"700", color:"#2E7D6A", marginBottom:10 },
  section:{ color:"#4C6E64", fontWeight:"700", marginBottom:8, marginTop: 16 },
  row:{ backgroundColor:"#fff", borderWidth:1, borderColor:"#CFE1DB", borderRadius:12, padding:12, marginBottom:10 },
  label:{ color:"#4C6E64", marginBottom:6, fontWeight:"600" },
  input:{ fontSize:16, color:"#1b1b1b" },
  showBtn:{ position:"absolute", right:12, bottom:12, paddingVertical:6, paddingHorizontal:8, borderRadius:8 },
  showTxt:{ color:"#2E7D6A", fontWeight:"700" },
  saveBtn:{ backgroundColor:"#2E7D6A", borderRadius:12, alignItems:"center", paddingVertical:12, marginTop:4 },
  saveTxt:{ color:"#fff", fontWeight:"700" },
  
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
});