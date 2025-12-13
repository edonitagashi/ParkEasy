import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { AntDesign } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";
import { resolveImage } from "../../components/images";
import SearchBar from "../../components/SearchBar";
import ParkingCard from "../../components/ParkingCard";

import useParkings from "../hooks/useParkings";
import useFavorites from "../hooks/useFavorites";

const placeholderImage = require("../../assets/images/image1.png");

const ITEM_HEIGHT = 160;

export default function SearchParkingScreen() {
  const [searchText, setSearchText] = useState("");
  const { parkings, loading, error, refresh } = useParkings();
  const { favorites, toggleFavorite } = useFavorites();
  const [userLocation, setUserLocation] = useState(null);

  const [sortOption, setSortOption] = useState("distance");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);


  const sortedByDistance = useMemo(() => {
    if (!userLocation || !parkings) return parkings || [];

    return [...parkings]
      .map((p) => {
        const lat = Number(p.coordinate?.latitude ?? p.latitude);
        const lng = Number(p.coordinate?.longitude ?? p.longitude);

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          return { ...p, distance: Infinity };
        }

        const distance = haversine(
          { lat: userLocation.latitude, lon: userLocation.longitude },
          { lat, lon: lng }
        );

        return { ...p, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [parkings, userLocation]);

  const filteredParkings = useMemo(() => {
    let list = [...(sortedByDistance || [])];

    // SEARCH FILTER
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      );
    }

    // SORTING OPTIONS
    switch (sortOption) {
      case "priceLow":
        return list.sort((a, b) => a.price - b.price);

      case "priceHigh":
        return list.sort((a, b) => b.price - a.price);

      case "nameAZ":
        return list.sort((a, b) => a.name.localeCompare(b.name));

      case "distance":
      default:
        return list;
    }
  }, [sortedByDistance, searchText, sortOption]);


  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ParkingCard
        item={{
          ...item,
          image:
            item.image || (item.imageUrl && resolveImage(item.imageUrl)) || placeholderImage,
          isFavorite: favorites.includes(item.id),
          onFavoriteToggle: () => toggleFavorite(item.id),
        }}
      />
    ),
    [favorites, toggleFavorite]
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  if (loading || !parkings) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <SearchHeader title="Search Parking" />
        <View style={styles.center}>
          <Text style={{ color: "red", marginBottom: 10 }}>
            Failed to load data.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={{ color: "#fff" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

 
  return (
    <SafeAreaView style={styles.container}>
      <SearchHeader title="Search Parking" />

      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} />

        {/* SORTING BUTTON */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu((prev) => !prev)}
        >
          <Text style={styles.sortButtonText}>
            Sort by:{" "}
            {sortOption === "distance"
              ? "Nearest"
              : sortOption === "priceLow"
              ? "Price ↑"
              : sortOption === "priceHigh"
              ? "Price ↓"
              : "Name A-Z"}
          </Text>
          <AntDesign name="down" size={16} />
        </TouchableOpacity>

        {/* SORT DROPDOWN MENU */}
        {showSortMenu && (
          <View style={styles.sortMenu}>
            <TouchableOpacity onPress={() => { setSortOption("distance"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Nearest</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setSortOption("priceLow"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Price (Low → High)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setSortOption("priceHigh"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Price (High → Low)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setSortOption("nameAZ"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Name (A → Z)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={filteredParkings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredParkings.length === 0 ? { flex: 1 } : styles.listContent
        }
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text>No results found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  searchContainer: { padding: 12 },

  sortButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  sortMenu: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 6,
    elevation: 4,
  },

  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#333",
  },

  listContent: { paddingBottom: 20 },

  retryBtn: {
    backgroundColor: "#2E7D6A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
