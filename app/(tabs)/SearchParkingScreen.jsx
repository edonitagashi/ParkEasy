import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import AnimatedTouchable from "../../components/animation/AnimatedTouchable";
import theme, { colors } from "../../components/theme";
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
    // skeleton list during initial load
    const skeletons = Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={{ height: ITEM_HEIGHT, marginHorizontal: 16, marginBottom: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', height: '100%', borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider }}>
          <View style={{ width: 120, height: '100%', backgroundColor: colors.divider }} />
          <View style={{ flex: 1, padding: theme.spacing.md }}>
            <View style={{ height: 14, width: '30%', backgroundColor: colors.divider, borderRadius: 6, marginBottom: theme.spacing.sm }} />
            <View style={{ height: 18, width: '60%', backgroundColor: colors.divider, borderRadius: 6, marginBottom: theme.spacing.sm }} />
            <View style={{ height: 12, width: '50%', backgroundColor: colors.divider, borderRadius: 6, marginBottom: theme.spacing.xs }} />
            <View style={{ height: 12, width: '40%', backgroundColor: colors.divider, borderRadius: 6 }} />
          </View>
        </View>
      </View>
    ));

    return (
      <SafeAreaView style={styles.container}>
        <SearchHeader title="Search Parking" />
        <View style={{ paddingTop: theme.spacing.md }}>{skeletons}</View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <SearchHeader title="Search Parking" />
        <View style={styles.center}>
          <Text style={{ color: colors.danger, marginBottom: theme.spacing.md - 2 }}>
            Failed to load data.
          </Text>
          <AnimatedTouchable style={styles.retryBtn} onPress={refresh}>
            <Text style={{ color: colors.textOnPrimary }}>Retry</Text>
          </AnimatedTouchable>
        </View>
      </SafeAreaView>
    );
  }

 
  return (
    <SafeAreaView style={styles.container} edges={["left","right"]}>
      <SearchHeader title="Search Parking" />

      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} />

        {/* SORTING BUTTON */}
        <AnimatedTouchable
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
        </AnimatedTouchable>

        {/* SORT DROPDOWN MENU */}
        {showSortMenu && (
          <View style={styles.sortMenu}>
            <AnimatedTouchable onPress={() => { setSortOption("distance"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Nearest</Text>
            </AnimatedTouchable>

            <AnimatedTouchable onPress={() => { setSortOption("priceLow"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Price (Low → High)</Text>
            </AnimatedTouchable>

            <AnimatedTouchable onPress={() => { setSortOption("priceHigh"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Price (High → Low)</Text>
            </AnimatedTouchable>

            <AnimatedTouchable onPress={() => { setSortOption("nameAZ"); setShowSortMenu(false); }}>
              <Text style={styles.sortOption}>Name (A → Z)</Text>
            </AnimatedTouchable>
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
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  searchContainer: { padding: theme.spacing.md },

  sortButton: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  sortMenu: {
    marginTop: theme.spacing.sm - theme.spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: theme.spacing.xs + 2,
    elevation: 4,
  },

  sortOption: {
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    paddingHorizontal: theme.spacing.md + 2,
    fontSize: 14,
    color: colors.text,
  },

  listContent: { paddingBottom: theme.spacing.xl - theme.spacing.sm },

  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.xl - theme.spacing.sm,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    borderRadius: 8,
  },
});
