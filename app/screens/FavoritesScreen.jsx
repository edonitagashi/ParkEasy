// app/screens/FavoritesScreen.jsx
import React, { useState } from "react";
import { SafeAreaView, FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import SearchHeader from "../../components/SearchHeader";
import ParkingCard from "../../components/ParkingCard";

export default function FavoritesScreen() {
  // Lista e parkimeve të gjitha (për shembull, nga Nearby)
  const initialParkings = [
    { id: "1", name: "City Center Parking", address: "Deshmoret e Kombit St.", distance: "150 m", price: "2 €/h", spots: 8 },
    { id: "2", name: "Theater Parking", address: "Skenderbej Square", distance: "320 m", price: "1.5 €/h", spots: 3 },
    { id: "3", name: "University Parking", address: "Zogu I Blvd.", distance: "500 m", price: "Free", spots: 10 },
    { id: "4", name: "Mall Parking", address: "Mall Street", distance: "600 m", price: "2 €/h", spots: 5 },
    { id: "5", name: "Train Station Parking", address: "Train Station", distance: "750 m", price: "1 €/h", spots: 2 },
    { id: "6", name: "Airport Parking", address: "Airport Rd.", distance: "1 km", price: "3 €/h", spots: 12 },
  ];

  // Gjendja e favorites
  const [favorites, setFavorites] = useState([
    "1",
    "3",
    "6"
  ]);

  // Funksioni për toggle favorite
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Filter për parkimet që janë favorite
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
              name={item.name}
              distance={item.distance}
              price={item.price}
              spots={item.spots}
              isFavorite={favorites.includes(item.id)}
              onFavoriteToggle={() => toggleFavorite(item.id)}
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
