import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../app/firebase/firebase";

export default function ParkingCard({ item, hideReserve }) {
  const [hasBooking, setHasBooking] = useState(false);

  // Kontrollo nese useri e ka rezervuar kete parking
  useEffect(() => {
    const checkBooking = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", auth.currentUser.uid),
          where("parkingId", "==", item.id)
        );

        const snap = await getDocs(q);
        setHasBooking(!snap.empty);
      } catch (err) {
        console.log("Error checking booking:", err);
      }
    };

    checkBooking();
  }, []);

  // Navigimi
  const handleReservePress = async () => {
    if (hasBooking) return; // mos hap edit prej ketu
    if (!auth.currentUser) return Alert.alert("Error", "You must be logged in.");

    try {
      // kontrollo edhe njehere realtime
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid),
        where("parkingId", "==", item.id)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        // shko me rezervu
        router.push({
          pathname: "/(tabs)/BookParkingScreen",
          params: { id: item.id, name: item.name },
        });
      }
    } catch (err) {
      Alert.alert("Error", "Could not process reservation.");
    }
  };

  return (
    <View style={{ marginBottom: 15, marginHorizontal: 16 }}>
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Parking Details",
            `Name: ${item.name}\nDistance: ${item.distance}\nPrice: ${item.price}\nAvailable Spots: ${item.spots}`
          )
        }
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#5C8374", "#6FA48B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Image */}
          <Image source={item.image} style={styles.image} />

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.bookingId}>ID: {item.id}</Text>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text style={styles.address}>{item.address}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detail}>Distance: {item.distance}</Text>
              <Text style={styles.detail}>Price: {item.price}</Text>
            </View>

            <Text style={styles.detail}>Available: {item.spots} spots</Text>
          </View>

          {/* Favorite */}
          <TouchableOpacity onPress={item.onFavoriteToggle} style={styles.bookmarkWrapper}>
            <Ionicons
              name={item.isFavorite ? "bookmark" : "bookmark-outline"}
              size={22}
              color={item.isFavorite ? "#e5d058ff" : "#fff"}
            />
          </TouchableOpacity>

          {/* Reserve / Reserved */}
          {!hideReserve && (
            <TouchableOpacity
              style={[
                styles.reserveBadge,
                hasBooking && { backgroundColor: "#4A6F6A", opacity: 0.85 }
              ]}
              disabled={hasBooking}
              onPress={handleReservePress}
            >
              <Ionicons
                name={hasBooking ? "checkmark-circle-outline" : "calendar-outline"}
                size={16}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.reserveBadgeText}>
                {hasBooking ? "Reserved" : "Reserve"}
              </Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    padding: 8,
    position: "relative",
  },

  image: {
    width: 120,
    height: 130,
    borderRadius: 12,
  },

  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },

  bookingId: { fontSize: 12, color: "#fff" },
  name: { fontSize: 16, fontWeight: "bold", color: "#fff", marginVertical: 4 },

  addressContainer: { flexDirection: "row", alignItems: "center" },
  address: { color: "#fff", marginLeft: 4, fontSize: 12 },

  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  detail: { color: "#fff", fontSize: 12, marginTop: 2 },

  bookmarkWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 6,
    borderRadius: 20,
  },

  reserveBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D6A",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },

  reserveBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 2,
  },
});
