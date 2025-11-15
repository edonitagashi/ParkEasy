import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";
import { resolveImage } from "../../components/images";
import SearchBar from "../../components/SearchBar";
import ParkingCard from "../../components/ParkingCard";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";  
const placeholderImage = require("../../assets/images/image1.png");

export default function SearchParkingScreen() {
  const [searchText, setSearchText] = useState("");
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParkings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parkings"));
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParkings(items);
      } catch (error) {
        console.log("Error loading parkings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadParkings();
  }, []);

  const filteredParkings = parkings.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.address.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading...</Text>
      </View>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParkingCard
            item={{
              ...item,
              image:
                item.image || (item.imageUrl && resolveImage(item.imageUrl)) || placeholderImage,
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
