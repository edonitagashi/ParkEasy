import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import ParkingCard from "../../components/ParkingCard";
import SearchHeader from "../../components/SearchHeader";

import useParkings from "../hooks/useParkings";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

const placeholderImage = require("../../assets/images/image1.png");

export default function FavoritesScreen() {
  // all parkings (realtime) from the shared hook
  const { parkings, loading: parkingsLoading, error: parkingsError, refresh } = useParkings();

  // favorites are stored in Firestore per user in: collection "favorites" doc id = user.uid
  const [favorites, setFavorites] = useState([]); // array of parking ids
  const [loading, setLoading] = useState(true); // loading for favorites read
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // require user to be logged in to read their favorites
    const user = auth.currentUser;
    if (!user) {
      // no user => show none (or optionally load from AsyncStorage if you want offline)
      setFavorites([]);
      setLoading(false);
      return;
    }

    const ref = doc(db, "favorites", user.uid);
    // listen to changes in user's favorites doc
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setFavorites(Array.isArray(data.parkingIds) ? data.parkingIds : []);
        } else {
          setFavorites([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Favorites onSnapshot error:", err);
        setFavorites([]);
        setLoading(false);
      }
    );

    return () => {
      try {
        unsub();
      } catch (e) {}
    };
  }, []);

  // Build favoriteParkings by joining parkings list with favorites ids
  const favoriteParkings = useMemo(() => {
    if (!parkings || parkings.length === 0) return [];
    return parkings.filter((p) => favorites.includes(p.id));
  }, [parkings, favorites]);

  // Toggle favorite for current user (updates Firestore)
  const toggleFavorite = async (parkingId) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Please sign in", "You need to be logged in to manage favorites.");
      return;
    }

    // optimistic local update for snappy UI
    setFavorites((prev) =>
      prev.includes(parkingId) ? prev.filter((id) => id !== parkingId) : [...prev, parkingId]
    );

    setSaving(true);
    try {
      const ref = doc(db, "favorites", user.uid);

      // read current server side list and compute new array to avoid race conditions
      // we use setDoc with merge to create the doc if missing
      // get the current favorites doc snapshot is not necessary because we used optimistic update,
      // but to be more robust we write the actual new array computed from the most recent local state.
      const newArray = favorites.includes(parkingId)
        ? favorites.filter((id) => id !== parkingId) // was favorite -> remove
        : [...favorites, parkingId]; // not favorite -> add

      await setDoc(ref, { parkingIds: newArray }, { merge: true });
    } catch (err) {
      console.error("Failed updating favorites:", err);
      Alert.alert("Error", "Could not update favorites. Please try again.");
      // revert local optimistic change on failure
      setFavorites((prev) =>
        prev.includes(parkingId) ? prev.filter((id) => id !== parkingId) : [...prev, parkingId]
      );
    } finally {
      setSaving(false);
    }
  };

  if (parkingsLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <SearchHeader title="Favorites" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2E7D6A" />
          <Text style={{ marginTop: 10 }}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (parkingsError) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <SearchHeader title="Favorites" />
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: "red", marginBottom: 12 }}>Failed to load parkings.</Text>
          <TouchableOpacity onPress={refresh} style={{ backgroundColor: "#2E7D6A", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
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