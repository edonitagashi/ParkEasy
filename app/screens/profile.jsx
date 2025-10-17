import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function Profile() {
  // NDËRRUAR: te gjitha fushat realisht editueshme (editable) + Show/Hide password
  const { name = "User", email: emailIn = "", phone: phoneIn = "", password: passIn = "" } = useLocalSearchParams();
  const router = useRouter();

  const [fullName, setFullName]   = useState(String(name));
  const [phoneNumber, setPhoneNumber] = useState(String(phoneIn));
  const [email, setEmail]         = useState(String(emailIn));
  const [password, setPassword]   = useState(String(passIn));
  const [showPwd, setShowPwd]     = useState(false);
  const [saved, setSaved]         = useState(false);

  const profileSrc = require("../../assets/icon.png");

  const handleSave = () => {
    if (!fullName.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Gabim", "Plotëso Emri, Numri, Email, Password.");
      return;
    }
    setSaved(true); setTimeout(() => setSaved(false), 1200);
    Alert.alert("Sukses", "Ndryshimet u ruajtën!");
  };

  return (
    <View style={s.container} pointerEvents="auto">
      <Image source={profileSrc} style={s.avatar} />
      <Text style={s.fullname}>{fullName || "Përdorues"}</Text>

      <Text style={s.section}>Edit profile</Text>

      {/* Emri */}
      <View style={s.row}>
        <Text style={s.label}>Emri</Text>
        <TextInput
          editable
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
          editable
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Shkruaj numrin"
          keyboardType="tel"
          style={s.input}
          autoCorrect={false}
        />
      </View>

      {/* Email */}
      <View style={s.row}>
        <Text style={s.label}>Email</Text>
        <TextInput
          editable
          value={email}
          onChangeText={setEmail}
          placeholder="Shkruaj email-in"
          autoCapitalize="none"
          keyboardType="email-address"
          style={s.input}
          autoCorrect={false}
          inputMode="email"
        />
      </View>

      {/* Password + Show/Hide */}
      <View style={[s.row, { position: "relative" }]}>
        <Text style={s.label}>Password</Text>
        <TextInput
          editable
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

      <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
        <Text style={s.saveTxt}>Ruaj ndryshimet</Text>
      </TouchableOpacity>
      {saved ? <Text style={s.saved}>U ruajt me sukses!</Text> : null}

      <TouchableOpacity style={s.logoutBtn} onPress={() => router.replace("/")}>
        <Text style={s.logoutTxt}>Logout ➜</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#E9F8F6", padding:20 },
  avatar:{ width:90, height:90, borderRadius:45, alignSelf:"center", marginTop:24, marginBottom:10 },
  fullname:{ textAlign:"center", fontSize:18, fontWeight:"700", color:"#2E7D6A", marginBottom:18 },
  section:{ color:"#4C6E64", fontWeight:"700", marginBottom:8 },
  row:{ backgroundColor:"#fff", borderWidth:1, borderColor:"#CFE1DB", borderRadius:12, padding:12, marginBottom:10 },
  label:{ color:"#4C6E64", marginBottom:6, fontWeight:"600" },
  input:{ fontSize:16, color:"#1b1b1b" },
  showBtn:{ position:"absolute", right:12, bottom:12, paddingVertical:6, paddingHorizontal:8, borderRadius:8 },
  showTxt:{ color:"#2E7D6A", fontWeight:"700" },
  saveBtn:{ backgroundColor:"#2E7D6A", borderRadius:12, alignItems:"center", paddingVertical:12, marginTop:4 },
  saveTxt:{ color:"#fff", fontWeight:"700" },
  saved:{ marginTop:6, color:"#1E5E4D", fontWeight:"600", alignSelf:"center" },
  logoutBtn:{ alignSelf:"flex-start", marginTop:12, paddingVertical:10, paddingHorizontal:14, borderRadius:12, borderWidth:2, borderColor:"#2E7D6A" },
  logoutTxt:{ color:"#2E7D6A", fontWeight:"700" },
});
