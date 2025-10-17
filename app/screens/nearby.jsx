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

const Nearby = () => {
  const router = useRouter();
  const { name = "User", email = "—", phone = "—", pwdLen = "8" } = useLocalSearchParams();
  const [showProfile, setShowProfile] = useState(false);
  const [fullName, setFullName] = useState(String(name));
  const profileSrc = require("../../assets/icon.png"); // placeholder lokal

  const [parkings] = useState([
    { id: "1", name: "City Center Parking", address: "Deshmoret e Kombit St.", distance: "150 m", price: "2 €/h", spots: 8 },
    { id: "2", name: "Theater Parking", address: "Skenderbej Square", distance: "320 m", price: "1.5 €/h", spots: 3 },
    { id: "3", name: "University Parking", address: "Zogu I Blvd.", distance: "500 m", price: "Free", spots: 10 },
    { id: "4", name: "Mall Parking", address: "Mall Street", distance: "600 m", price: "2 €/h", spots: 5 },
    { id: "5", name: "Train Station Parking", address: "Train Station", distance: "750 m", price: "1 €/h", spots: 2 },
    { id: "6", name: "Airport Parking", address: "Airport Rd.", distance: "1 km", price: "3 €/h", spots: 12 },
    { id: "7", name: "Library Parking", address: "Library St.", distance: "850 m", price: "Free", spots: 6 },
    { id: "8", name: "Hospital Parking", address: "Hospital Rd.", distance: "900 m", price: "1 €/h", spots: 0 },
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
        {/* NDËRRUAR: avatar sipër djathtas që hap modalin e profilit */}
        <TouchableOpacity style={styles.avatarBtn} onPress={() => setShowProfile(true)}>
          <Image source={profileSrc} style={styles.avatar} />
        </TouchableOpacity>
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
        renderItem={({ item }) => (
          <ParkingCard
            name={item.name}
            address={item.address}
            distance={item.distance}
            price={item.price}
            spots={item.spots}
          />
        )}
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
