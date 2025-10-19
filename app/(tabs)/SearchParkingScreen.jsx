import React, { useState } from "react";
import {
  View,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";
import SearchBar from "../../components/SearchBar";
import ParkingCard from "../../components/ParkingCard";

const placeholderImage = require("../../assets/images/image1.png");

export default function SearchParkingScreen() {
  const [searchText, setSearchText] = useState("");

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

  const filteredParkings = parkings.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SearchHeader title="Search Parking" />

      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
      </View>

      <FlatList
        data={filteredParkings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParkingCard
            item={{ 
              ...item,
              image: item.image ? item.image : placeholderImage,
             }}
             />
        )}
        contentContainerStyle={
          filteredParkings.length === 0 ? { flex: 1 } : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.noResultsWrapper}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchContainer: { paddingHorizontal: 12, marginTop: 8 },
  listContent: { padding: 10, backgroundColor: "#fff" },
  noResultsText: { color: "#777", fontSize: 16 },
  noResultsWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});
