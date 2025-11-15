import React, { useState } from "react";
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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
  // use the reusable hook (reads parkings in realtime)
  const { parkings, loading, error, refresh } = useParkings();

  const [showFullMap, setShowFullMap] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [searchText, setSearchText] = useState("");

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading...</Text>
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
       {/* <MapView
          style={styles.map}
          initialRegion={{
            latitude: 42.6629,
            longitude: 21.1655,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
        >
          {parkings.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.name}
              description={p.address}
            />
          ))}
        </MapView>
*/}

        <View style={styles.overlay}>
          <Text style={styles.mapText}>Tap to view full map</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={styles.sortText}>Sort by: Distance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={refresh}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={parkings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParkingCard
            item={{
              ...item,
              image:
                // prefer already-resolved item.image
                item.image ||
                // try Firestore imageUrl path mapping to local assets
                (item.imageUrl && resolveImage(item.imageUrl)) ||
                placeholderImage,
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={refresh}
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
  controls: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, paddingHorizontal: 16 },
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