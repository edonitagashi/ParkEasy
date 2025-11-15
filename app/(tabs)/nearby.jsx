import React, { useState, useMemo } from "react";
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
//import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";
import { resolveImage } from "../../components/images";
import ParkingCard from "../../components/ParkingCard";

import useParkings from "../hooks/useParkings";

const placeholderImage = require("../../assets/images/image1.png");

const Nearby = () => {
  // realtime parkings via onSnapshot
  const { parkings, loading, error, refresh } = useParkings();

  const [showFullMap, setShowFullMap] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [searchText, setSearchText] = useState("");

  const filtered = useMemo(() => {
    if (!parkings || parkings.length === 0) return [];
    if (!searchText?.trim()) return parkings;
    const q = searchText.trim().toLowerCase();
    return parkings.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const address = (p.address || "").toLowerCase();
      return name.includes(q) || address.includes(q);
    });
  }, [parkings, searchText]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D6A" />
        <Text style={{ marginTop: 10 }}>Loading parkings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <SearchHeader title="Nearby Parkings" />
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "red", marginBottom: 12 }}>Failed to load parkings.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={refresh}>
            <Text style={styles.refreshText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SearchHeader title="Nearby Parkings" />

      <TouchableOpacity
        style={styles.mapPreview}
        onPress={() => setShowFullMap(true)}
      >
        {/* Map placeholder */}
        <View style={styles.overlay}>
          <Text style={styles.mapText}>Tap to view full map</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TextInput
          placeholder="Search parkings..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        <TouchableOpacity style={styles.refreshBtn} onPress={refresh}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParkingCard
            item={{
              ...item,
              image:
                item.image ||
                (item.imageUrl && resolveImage(item.imageUrl)) ||
                placeholderImage,
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#777" }}>No parkings found.</Text>
          </View>
        )}
      />

      {selectedParking && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{selectedParking.name}</Text>
          <Text style={styles.infoText}>{selectedParking.address}</Text>
          <Text style={styles.infoText}>
            {selectedParking.price} • {selectedParking.spots} spots
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Nearby;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  mapPreview: { height: 220, marginHorizontal: 16, marginVertical: 10, borderRadius: 12, overflow: "hidden", position: "relative" },
  map: { width: "100%", height: "100%" },
  fullMapOverlay: {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,zIndex: 10,elevation: 10,backgroundColor: "#fff",},
  controls: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, paddingHorizontal: 16, alignItems: "center" },
  searchInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 10, marginRight: 8, backgroundColor: "#fff" },
  sortBtn: { backgroundColor: "#CDE6DC", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  sortText: { color: "#5C8374", fontWeight: "500" },
  refreshBtn: { backgroundColor: "#5C8374", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  refreshText: { color: "#fff", fontWeight: "bold" },
  overlay: { position: "absolute", bottom: 10, left: 0, right: 0, alignItems: "center" },
  mapText: { backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, fontWeight: "500" },
  infoBox: { position: "absolute", bottom: 50, left: 20, right: 20, backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 5 },
  infoTitle: { fontWeight: "700", fontSize: 16, marginBottom: 5 },
  infoText: { color: "#555", fontSize: 14 },
  closeBtn: { position: "absolute", top: 40, right: 20, backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, elevation: 5 },
  closeTxt: { fontWeight: "700", color: "#333" },
});