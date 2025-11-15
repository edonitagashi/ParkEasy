import React, { useState, useEffect } from "react";
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
//import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";
import ParkingCard from "../../components/ParkingCard";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

const placeholderImage = require("../../assets/images/image1.png");

const Nearby = () => {
  const [showFullMap, setShowFullMap] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);

  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParkings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parkings"));
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParkings(items);
      } catch (err) {
        console.log("Error loading parkings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadParkings();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading...</Text>
      </View>
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

        <TouchableOpacity style={styles.refreshBtn}>
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
              image: placeholderImage,
     }}
     hideReserve={true}
  />

        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/*{showFullMap && (
        <View style={styles.fullMapOverlay}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 42.6629,
              longitude: 21.1655,
              latitudeDelta: 0.3,
              longitudeDelta: 0.3,
            }}
          >
            {parkings.map((p) => (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                title={p.name}
                description={`${p.address} - ${p.price}`}
                onPress={() => setSelectedParking(p)}
              />
            ))}
          </MapView>
          */}

          {selectedParking && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>{selectedParking.name}</Text>
              <Text style={styles.infoText}>{selectedParking.address}</Text>
              <Text style={styles.infoText}>
                {selectedParking.price} • {selectedParking.spots} spots
              </Text>
            </View>
          )}

          {/*<TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowFullMap(false)}
          >
            <Text style={styles.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      )}*/}
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
