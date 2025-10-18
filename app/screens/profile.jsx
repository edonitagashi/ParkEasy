// app/screens/profile.jsx
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
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const USERS_KEY = "users";               // lista e përdoruesve
const CURRENT_USER_KEY = "currentUser";  // sesioni aktiv

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

  // ✅ Mesazhi i gjelbër i suksesit
  const [successMsg, setSuccessMsg]   = useState("");

  const placeholder = require("../../assets/icon.png");

  // Load currentUser nga AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (!raw) {
          Alert.alert("Sesion i mbyllur", "Kyçu për të parë profilin.");
          router.replace("/auth/LoginScreen");
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
        Alert.alert("Gabim", "S’u lexuan të dhënat e profilit.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Zgjedh foto + sinkronizo currentUser dhe users
  const pickFromLibrary = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Leje e nevojshme", "Na duhet leja për të qasur fotot.");
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
      Alert.alert("Gabim", "Nuk u zgjodh fotoja.");
    }
  };

  // Heq foto + sinkronizo currentUser dhe users
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

  // Ruaj ndryshimet në currentUser + users
  const handleSave = async () => {
    if (saving) return;
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Gabim", "Plotëso Emri, Numri, Email, Password.");
    }
    setSaving(true);
    try {
      const rawCur = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!rawCur) {
        Alert.alert("Sesion i mbyllur", "Kyçu përsëri.");
        router.replace("/auth/LoginScreen");
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

      // ✅ Mesazh i gjelbër poshtë butonit
      setSuccessMsg("✅ Ndryshimet u ruajtën me sukses!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      console.error("Profile save error:", e);
      Alert.alert("Gabim", "Nuk u ruajtën ndryshimet.");
    } finally {
      setSaving(false);
    }
  };

  // Logout: hiq vetëm currentUser
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch {}
    router.replace("/"); // te hyrja
  };

  if (loading) {
    return (
      <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#4C6E64" }}>Duke ngarkuar profilin...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
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

      <Text style={s.fullname}>{fullName || "Përdorues"}</Text>

      <Text style={s.section}>Edit profile</Text>

      {/* Emri */}
      <View style={s.row}>
        <Text style={s.label}>Emri</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Shkruaj emrin"
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
          placeholder="Shkruaj numrin"
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
          placeholder="Shkruaj email-in"
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
          placeholder="Shkruaj fjalëkalimin"
          secureTextEntry={!showPwd}
          style={[s.input, { paddingRight: 64 }]}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={s.showBtn}>
          <Text style={s.showTxt}>{showPwd ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
        <Text style={s.saveTxt}>{saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}</Text>
      </TouchableOpacity>

      {/* ✅ Mesazhi i suksesit poshtë butonit */}
      {successMsg ? <Text style={s.successMsg}>{successMsg}</Text> : null}

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutTxt}>Logout ➜</Text>
      </TouchableOpacity>
    </View>
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
  section:{ color:"#4C6E64", fontWeight:"700", marginBottom:8 },
  row:{ backgroundColor:"#fff", borderWidth:1, borderColor:"#CFE1DB", borderRadius:12, padding:12, marginBottom:10 },
  label:{ color:"#4C6E64", marginBottom:6, fontWeight:"600" },
  input:{ fontSize:16, color:"#1b1b1b" },
  showBtn:{ position:"absolute", right:12, bottom:12, paddingVertical:6, paddingHorizontal:8, borderRadius:8 },
  showTxt:{ color:"#2E7D6A", fontWeight:"700" },
  saveBtn:{ backgroundColor:"#2E7D6A", borderRadius:12, alignItems:"center", paddingVertical:12, marginTop:4 },
  saveTxt:{ color:"#fff", fontWeight:"700" },
  // ✅ Stili i mesazhit të suksesit
  successMsg:{
    color:"#2E7D6A",
    backgroundColor:"#DFF6E3",
    textAlign:"center",
    paddingVertical:8,
    marginTop:10,
    borderRadius:8,
    fontWeight:"700",
  },
  logoutBtn:{ alignSelf:"flex-start", marginTop:12, paddingVertical:10, paddingHorizontal:14, borderRadius:12, borderWidth:2, borderColor:"#2E7D6A" },
  logoutTxt:{ color:"#2E7D6A", fontWeight:"700" },
});
