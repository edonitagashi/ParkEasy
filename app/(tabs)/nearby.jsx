import React, { useState } from "react";
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

const Nearby = () => {
  const [showFullMap, setShowFullMap] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);

  const [parkings] = useState([
    { id: "E001", name: "Parking Prishtina Center", address: "Rruga Nëna Terezë, Prishtinë, Kosovo", latitude: 42.6629, longitude: 21.1655, distance: 0.5, price: "1€/h", spots: 7, image: require("../../assets/images/image1.png") },
    { id: "E002", name: "Parking Mother Teresa", address: "Rruga Lidhja e Pejës, Prishtinë, Kosovo", latitude: 42.6635, longitude: 21.1600, distance: 1.2, price: "0.8€/h", spots: 3, image: require("../../assets/images/image2.png") },
    { id: "E003", name: "Parking Peja Mall", address: "Rruga Bjeshkët e Nemuna, Pejë, Kosovo", latitude: 42.6607, longitude: 20.2887, distance: 3.5, price: "1.2€/h", spots: 5, image: require("../../assets/images/image3.png") },
    { id: "E004", name: "Parking Gërmia", address: "Rruga Gërmia, Prishtinë, Kosovo", latitude: 42.6701, longitude: 21.1855, distance: 2.1, price: "0.5€/h", spots: 10, image: require("../../assets/images/image5.png") },
    { id: "E005", name: "Parking Dardania", address: "Rruga Dardania, Prishtinë, Kosovo", latitude: 42.6543, longitude: 21.1658, distance: 1.8, price: "1€/h", spots: 0, image: require("../../assets/images/image4.png") },
    { id: "E006", name: "Parking Mitrovica City", address: "Rruga 1 Tetori, Mitrovicë, Kosovo", latitude: 42.8894, longitude: 20.8656, distance: 4.5, price: "0.7€/h", spots: 2, image: require("../../assets/images/image6.png") },
    { id: "E007", name: "Parking Prizren Old Town", address: "Rruga Shatervan, Prizren, Kosovo", latitude: 42.2139, longitude: 20.7397, distance: 5.0, price: "1.5€/h", spots: 8, image: require("../../assets/images/image7.png") },
    { id: "E008", name: "Parking Ferizaj Center", address: "Rruga Rexhep Luci, Ferizaj, Kosovo", latitude: 42.3700, longitude: 21.1550, distance: 3.0, price: "1€/h", spots: 6, image: require("../../assets/images/image8.png") },
  ]);

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
        renderItem={({ item }) => <ParkingCard item={item} />}
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
