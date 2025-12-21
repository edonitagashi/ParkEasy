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
import theme, { colors } from "../hooks/theme";
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

const formatDistance = (meters) => {
  if (!meters || meters === Infinity) return "— km";
  const km = meters / 1000;
  if (km < 0.1) return "< 0.1 km";
  if (km < 10) return km.toFixed(1) + " km";
  return km.toFixed(0) + " km";
};

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

  const parkingsWithDistance = useMemo(() => {
    if (!parkings || !userLocation) return parkings || [];

    return parkings.map((p) => {
      const lat = Number(p.coordinate?.latitude ?? p.latitude);
      const lng = Number(p.coordinate?.longitude ?? p.longitude);

      let distance = Infinity;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        distance = haversine(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: lat, longitude: lng }
        );
      }

      return {
        ...p,
        distanceMeters: distance,
        distanceFormatted: formatDistance(distance),
        priceNumeric: p.price ? parseFloat(p.price) : 0, 
      };
    });
  }, [parkings, userLocation]);

 
  const filteredAndSortedParkings = useMemo(() => {
    let list = [...parkingsWithDistance];

 
    
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      );
    }

   
    switch (sortOption) {
      case "priceLow":
        return list.sort((a, b) => a.priceNumeric - b.priceNumeric);
      case "priceHigh":
        return list.sort((a, b) => b.priceNumeric - a.priceNumeric);
      case "nameAZ":
        return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "distance":
      default:
        return list.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
  }, [parkingsWithDistance, searchText, sortOption]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ParkingCard
        item={{
          ...item,
          image:
            item.imageUrl
              ? resolveImage(item.imageUrl)
              : item.image || placeholderImage,
          isFavorite: favorites.includes(item.id),
          onFavoriteToggle: () => toggleFavorite(item.id),
        
          distance: item.distanceFormatted,
          pricePerHour: item.price ? `$${item.price}/hr` : "Free",
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
    const skeletons = Array.from({ length: 6 }).map((_, i) => (
      <View
        key={i}
        style={{
          height: ITEM_HEIGHT,
          marginHorizontal: 16,
          marginBottom: theme.spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            height: "100%",
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
          }}
        >
          <View style={{ width: 120, height: "100%", backgroundColor: colors.divider }} />
          <View style={{ flex: 1, padding: theme.spacing.md }}>
            <View
              style={{
                height: 14,
                width: "30%",
                backgroundColor: colors.divider,
                borderRadius: 6,
                marginBottom: theme.spacing.sm,
              }}
            />
            <View
              style={{
                height: 18,
                width: "60%",
                backgroundColor: colors.divider,
                borderRadius: 6,
                marginBottom: theme.spacing.sm,
              }}
            />
            <View
              style={{
                height: 12,
                width: "50%",
                backgroundColor: colors.divider,
                borderRadius: 6,
                marginBottom: theme.spacing.xs,
              }}
            />
            <View
              style={{
                height: 12,
                width: "40%",
                backgroundColor: colors.divider,
                borderRadius: 6,
              }}
            />
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
          <Text style={{ color: colors.danger, marginBottom: theme.spacing.md }}>
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
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <SearchHeader title="Search Parking" />

      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} />

        <AnimatedTouchable
          style={styles.sortButton}
          onPress={() => setShowSortMenu((prev) => !prev)}
        >
          <Text style={styles.sortButtonText}>
            Sort by:{" "}
            {sortOption === "distance"
              ? "Nearest"
              : sortOption === "priceLow"
              ? "Price (Low → High)"
              : sortOption === "priceHigh"
              ? "Price (High → Low)"
              : "Name (A → Z)"}
          </Text>
          <AntDesign name={showSortMenu ? "up" : "down"} size={16} color={colors.text} />
        </AnimatedTouchable>

        {showSortMenu && (
          <View style={styles.sortMenu}>
            <AnimatedTouchable
              onPress={() => {
                setSortOption("distance");
                setShowSortMenu(false);
              }}
            >
              <Text style={styles.sortOption}>Nearest</Text>
            </AnimatedTouchable>

            <AnimatedTouchable
              onPress={() => {
                setSortOption("priceLow");
                setShowSortMenu(false);
              }}
            >
              <Text style={styles.sortOption}>Price (Low → High)</Text>
            </AnimatedTouchable>

            <AnimatedTouchable
              onPress={() => {
                setSortOption("priceHigh");
                setShowSortMenu(false);
              }}
            >
              <Text style={styles.sortOption}>Price (High → Low)</Text>
            </AnimatedTouchable>

            <AnimatedTouchable
              onPress={() => {
                setSortOption("nameAZ");
                setShowSortMenu(false);
              }}
            >
              <Text style={styles.sortOption}>Name (A → Z)</Text>
            </AnimatedTouchable>
          </View>
        )}
      </View>

      <FlatList
        data={filteredAndSortedParkings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredAndSortedParkings.length === 0
            ? { flex: 1 }
            : styles.listContent
        }
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={{ color: colors.textSecondary }}>No results found</Text>
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
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  sortOption: {
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
    color: colors.text,
  },

  listContent: { paddingBottom: theme.spacing.xl },

  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    borderRadius: 8,
  },
});