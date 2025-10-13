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
    </SafeAreaView>    
  );
};

export default Nearby;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 10 },
  mapContainer: { height: 200, marginBottom: 15, borderRadius: 10, overflow: "hidden" },
  mapImage: { width: "100%", height: "100%" },

});
