import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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
  const { parkings, loading, error, refresh } = useParkings(); // realtime onSnapshot
  const { favorites, toggleFavorite } = useFavorites();

  const filteredParkings = useMemo(() => {
    const list = parkings || [];
    if (!searchText?.trim()) return list;
    const q = searchText.trim().toLowerCase();
    return list.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const address = (p.address || "").toLowerCase();
      return name.includes(q) || address.includes(q);
    });
  }, [parkings, searchText]);

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

  const getItemLayout = useCallback((_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }), []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D6A" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <SearchHeader title="Search Parking" />
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "red", marginBottom: 12 }}>Failed to load parkings.</Text>
          <TouchableOpacity onPress={refresh} style={{ backgroundColor: "#2E7D6A", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SearchHeader title="Search Parking" />

      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
      </View>

      <FlatList
        data={filteredParkings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={9}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
        contentContainerStyle={
          filteredParkings.length === 0 ? { flex: 1 } : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.noResultsWrapper}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )}
        refreshing={loading}
        onRefresh={refresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchContainer: { padding: 12 },
  listContent: { paddingBottom: 24 },
  noResultsWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  noResultsText: { color: "#666" },
});