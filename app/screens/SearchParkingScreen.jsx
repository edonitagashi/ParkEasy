import React, { useState } from "react";
import {
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import SearchHeader from "../../components/SearchHeader";
import SearchBar from "../../components/SearchBar";
import SearchResultItem from "../../components/SearchResultItem";


const placeholderImage = require("../../assets/images/image1.png");

export default function SearchParkingScreen() {
  const [searchText, setSearchText] = useState("");

  const [parkings] = useState([
    { id: "E001", name: "Parking Prishtina Center", address: "Rruga Nëna Terezë, Prishtinë, Kosovo", image: require("../../assets/images/image1.png") },
    { id: "E002", name: "Parking Mother Teresa", address: "Rruga Lidhja e Pejës, Prishtinë, Kosovo", image: require("../../assets/images/image2.png") },
    { id: "E003", name: "Parking Peja Mall", address: "Rruga Bjeshkët e Nemuna, Pejë, Kosovo", image: require("../../assets/images/image3.png") },
    { id: "E004", name: "Parking Gërmia", address: "Rruga Gërmia, Prishtinë, Kosovo", image: require("../../assets/images/image4.png") },
    { id: "E005", name: "Parking Dardania", address: "Rruga Dardania, Prishtinë, Kosovo", image: require("../../assets/images/image5.png") },
    { id: "E006", name: "Parking Mitrovica City", address: "Rruga 1 Tetori, Mitrovicë, Kosovo", image: require("../../assets/images/image6.png") },
    { id: "E007", name: "Parking Prizren Old Town", address: "Rruga Shatervan, Prizren, Kosovo", image: require("../../assets/images/image7.png") },
    { id: "E008", name: "Parking Ferizaj Center", address: "Rruga Rexhep Luci, Ferizaj, Kosovo", image: require("../../assets/images/image8.png") },
  ]);

  const filteredParkings = parkings.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SearchHeader />
      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
      </View>
      <FlatList
        data={filteredParkings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SearchResultItem
            item={{
              ...item,
              image: item.image ? item.image : placeholderImage,
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchContainer: { paddingHorizontal: 12, marginTop: 8 },
  listContent: { padding: 10, backgroundColor: "#fff" },
});
