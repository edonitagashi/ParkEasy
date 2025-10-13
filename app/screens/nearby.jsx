import React, { useState } from "react";
import {StatusBar,View,FlatList,Text,Image,TouchableOpacity,StyleSheet,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";

const Nearby = () => {
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
    <SafeAreaView style={styles.container}>
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

    </SafeAreaView>    
  );
};

export default Nearby;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 10 },
  mapContainer: { height: 200, marginBottom: 15, borderRadius: 10, overflow: "hidden" },
  mapImage: { width: "100%", height: "100%" },
  controls: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  sortBtn: { backgroundColor: "#CDE6DC", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  sortText: { color: "#5C8374", fontWeight: "500" },
  refreshBtn: { backgroundColor: "#5C8374", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  refreshText: { color: "#fff", fontWeight: "bold" },

});
