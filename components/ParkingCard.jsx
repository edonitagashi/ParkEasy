import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import OptimizedImage from "./OptimizedImage";


function ParkingCard({ item, hideReserve }) {
  const [isFavorite, setIsFavorite] = useState(item?.isFavorite);

  // keep local state synced when prop changes
  useEffect(() => {
    setIsFavorite(item?.isFavorite);
  }, [item?.isFavorite]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    if (item?.onFavoriteToggle) item.onFavoriteToggle();
  }, [item]);

  const handleReserve = useCallback(() => {
    router.push({
      pathname: "/(tabs)/BookParkingScreen",
      params: { id: item.id, name: item.name },
    });
  }, [item?.id, item?.name]);

  const showDetails = useCallback(() => {
    Alert.alert(
      "Parking Details",
      `Name: ${item.name}\nDistance: ${item.distance}\nPrice: ${item.price}\nAvailable Spots: ${item.spots}`
    );
  }, [item]);

  return (
    <View style={{ marginBottom: 15, marginHorizontal: 16 }}>
      <TouchableOpacity onPress={showDetails} activeOpacity={0.9}>
        <LinearGradient
          colors={["#5C8374", "#6FA48B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View>
            <OptimizedImage source={item.image} thumbnail={item.imageThumb || null} style={styles.image} />
          </View>

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

          <TouchableOpacity onPress={toggleFavorite} style={styles.bookmarkWrapper}>
            <Ionicons
              name={isFavorite ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isFavorite ? "#e5d058ff" : "#fff"}
            />
          </TouchableOpacity>

          {!hideReserve && (
            <TouchableOpacity style={styles.reserveBadge} onPress={handleReserve}>
              <Ionicons name="calendar-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.reserveBadgeText}>Reserve</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}


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
    elevation: 6,
  },

  reserveBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});

function areEqual(prevProps, nextProps) {
  // Re-render only if important bits changed
  if (prevProps.item?.id !== nextProps.item?.id) return false;
  if (prevProps.item?.isFavorite !== nextProps.item?.isFavorite) return false;
  return prevProps.hideReserve === nextProps.hideReserve;
}

export default React.memo(ParkingCard, areEqual);