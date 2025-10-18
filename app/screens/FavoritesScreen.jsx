import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import ParkingCard from "../../components/ParkingCard";
import SearchHeader from "../../components/SearchHeader";

const placeholderImage = require("../../assets/images/image1.png");

export default function FavoritesScreen() {
  const initialParkings = [
    { id: "1", name: "City Center Parking", address: "Deshmoret e Kombit St.", distance: "150 m", price: "2 €/h", spots: 8, image: require("../../assets/images/image1.png") },
    { id: "2", name: "Theater Parking", address: "Skenderbej Square", distance: "320 m", price: "1.5 €/h", spots: 3, image: require("../../assets/images/image2.png") },
    { id: "3", name: "University Parking", address: "Zogu I Blvd.", distance: "500 m", price: "Free", spots: 10, image: require("../../assets/images/image3.png") },
    { id: "4", name: "Mall Parking", address: "Mall Street", distance: "600 m", price: "2 €/h", spots: 5, image: require("../../assets/images/image4.png") },
    { id: "5", name: "Train Station Parking", address: "Train Station", distance: "750 m", price: "1 €/h", spots: 2, image: require("../../assets/images/image5.png") },
    { id: "6", name: "Airport Parking", address: "Airport Rd.", distance: "1 km", price: "3 €/h", spots: 12, image: require("../../assets/images/image6.png") },
  ];

  const [favorites, setFavorites] = useState(["1", "3", "6"]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const favoriteParkings = initialParkings.filter((p) => favorites.includes(p.id));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SearchHeader title="Favorites" />

      {favoriteParkings.length === 0 ? (
        <View style={styles.noFavorites}>
          <Text style={styles.noText}>You have no favorite parkings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteParkings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ParkingCard
              item={{
                ...item,
                image: item.image || placeholderImage,
                isFavorite: favorites.includes(item.id), 
                onFavoriteToggle: () => toggleFavorite(item.id),
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={{ flex: 1 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  noFavorites: { flex: 1, justifyContent: "center", alignItems: "center" },
  noText: { fontSize: 16, color: "#777" },
});
