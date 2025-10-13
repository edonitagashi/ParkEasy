import React, { useState } from "react";
import {StatusBar,View,FlatList,Text,Image,TouchableOpacity,StyleSheet,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";

const Nearby = () => {
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
