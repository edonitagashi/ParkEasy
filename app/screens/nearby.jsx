import React, { useState } from "react";
import {StatusBar,View,FlatList,Text,Image,TouchableOpacity,StyleSheet,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";

const Nearby = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SearchHeader title="Nearby Parkings" />
    </SafeAreaView>
  );
};

export default Nearby;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 10 },
});
