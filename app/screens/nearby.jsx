import React, { useState } from "react";
import {
  StatusBar,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import SearchHeader from "../../components/SearchHeader";
import ParkingCard from "../../components/ParkingCard";
const placeholderImage = require("../../assets/images/image1.png");

const Nearby = () => {
  const router = useRouter();
  const { name = "User", email = "—", phone = "—", pwdLen = "8" } = useLocalSearchParams();
  const [showProfile, setShowProfile] = useState(false);
  const [fullName, setFullName] = useState(String(name));
  const profileSrc = require("../../assets/icon.png"); // placeholder lokal

  const [parkings] = useState([
    { id: "E001", name: "Parking Prishtina Center", address: "Rruga Nëna Terezë, Prishtinë, Kosovo", distance: 0.5, price: "1€/h", spots: 7, image: require("../../assets/images/image1.png") },
    { id: "E002", name: "Parking Mother Teresa", address: "Rruga Lidhja e Pejës, Prishtinë, Kosovo", distance: 1.2, price: "0.8€/h", spots: 3, image: require("../../assets/images/image2.png") },
    { id: "E003", name: "Parking Peja Mall", address: "Rruga Bjeshkët e Nemuna, Pejë, Kosovo", distance: 3.5, price: "1.2€/h", spots: 5, image: require("../../assets/images/image3.png") },
    { id: "E004", name: "Parking Gërmia", address: "Rruga Gërmia, Prishtinë, Kosovo", distance: 2.1, price: "0.5€/h", spots: 10, image: require("../../assets/images/image5.png") },
    { id: "E005", name: "Parking Dardania", address: "Rruga Dardania, Prishtinë, Kosovo", distance: 1.8, price: "1€/h", spots: 0, image: require("../../assets/images/image4.png") },
    { id: "E006", name: "Parking Mitrovica City", address: "Rruga 1 Tetori, Mitrovicë, Kosovo", distance: 4.5, price: "0.7€/h", spots: 2, image: require("../../assets/images/image6.png") },
    { id: "E007", name: "Parking Prizren Old Town", address: "Rruga Shatervan, Prizren, Kosovo", distance: 5.0, price: "1.5€/h", spots: 8, image: require("../../assets/images/image7.png") },
    { id: "E008", name: "Parking Ferizaj Center", address: "Rruga Rexhep Luci, Ferizaj, Kosovo", distance: 3.0, price: "1€/h", spots: 6, image: require("../../assets/images/image8.png") },
  ]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SearchHeader title="Nearby Parkings" />

      <View style={styles.mapContainer}>
        <Image
          source={require("../../assets/images/map.png")}
          style={styles.mapImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={styles.sortText}>Sort by: Distance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

<FlatList
  data={parkings}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ParkingCard item={item} />}
  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
  contentContainerStyle={{ paddingBottom: 20 }}
  style={{ flex: 1 }}
/>


      <Modal
        visible={showProfile}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfile(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.cardProfile}>
            <Image source={profileSrc} style={styles.cardAvatar} />
            <Text style={styles.cardName}>{fullName}</Text>

            <Text style={styles.section}>Edit profile</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Emri</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Shkruaj emrin"
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.readonly}>{phone}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.readonly}>{email}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.readonly}>{"•".repeat(Number(pwdLen) || 8)}</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setShowProfile(false)}>
              <Text style={styles.saveTxt}>Ruaj ndryshimet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                setShowProfile(false);
                router.replace("/"); // kthen te index.jsx (ParkEasy – Login/Register)
              }}
            >
              <Text style={styles.logoutTxt}>Logout ➜</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Nearby;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  mapContainer: {
    height: 250,
    marginBottom: 15,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 16,
    position: "relative",
  },
  mapImage: { width: "100%", height: "100%", borderRadius: 10 },

  avatarBtn: { position: "absolute", top: 12, right: 28, zIndex: 10, elevation: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },

  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingLeft: 16,
    paddingRight: 16,
  },
  sortBtn: { backgroundColor: "#CDE6DC", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  sortText: { color: "#5C8374", fontWeight: "500" },
  refreshBtn: { backgroundColor: "#5C8374", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  refreshText: { color: "#fff", fontWeight: "bold" },

  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  cardProfile: { width: "92%", backgroundColor: "#E9F8F6", borderRadius: 16, padding: 16 },
  cardAvatar: { width: 80, height: 80, borderRadius: 40, alignSelf: "center", marginTop: 6, marginBottom: 6 },
  cardName: { textAlign: "center", fontSize: 16, fontWeight: "700", color: "#2E7D6A", marginBottom: 10 },
  section: { color: "#4C6E64", fontWeight: "700", marginBottom: 8 },
  row: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#CFE1DB", borderRadius: 12, padding: 12, marginBottom: 10 },
  label: { color: "#4C6E64", marginBottom: 6, fontWeight: "600" },
  readonly: { fontSize: 16, color: "#1b1b1b" },
  input: { fontSize: 16, color: "#1b1b1b" },
  saveBtn: { backgroundColor: "#2E7D6A", borderRadius: 12, alignItems: "center", paddingVertical: 12, marginTop: 4 },
  saveTxt: { color: "#fff", fontWeight: "700" },
  logoutBtn: { alignSelf: "flex-start", marginTop: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, borderColor: "#2E7D6A" },
  logoutTxt: { color: "#2E7D6A", fontWeight: "700" },
});
