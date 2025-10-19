import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ParkingCard({ item }) {
  const handlePress = () => {
    Alert.alert(
      "Parking Details",
      `Name: ${item.name}\nDistance: ${item.distance}\nPrice: ${item.price}\nAvailable Spots: ${item.spots}`
    );
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <LinearGradient
        colors={["#5C8374", "#6FA48B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Image source={item.image} style={styles.image} />

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

        <TouchableOpacity onPress={item.onFavoriteToggle} style={styles.bookmarkWrapper}>
          <Ionicons
            name={item.isFavorite ? "bookmark" : "bookmark-outline"}
            size={22}
            color={item.isFavorite ? "#e5d058ff" : "#fff"}
            style={styles.bookmarkIcon}
          />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    marginVertical: 6,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: "center",
    padding: 5,
    position: "relative",
    marginHorizontal:16,
  },
  image: { width: 120, height: 130, borderRadius: 12, },
  infoContainer: { flex: 1, padding: 12, justifyContent: "center" },
  bookingId: { fontSize: 12, color: "#fff" },
  name: { fontSize: 16, fontWeight: "bold", color: "#fff", marginVertical: 4 },
  addressContainer: { flexDirection: "row", alignItems: "center" },
  address: { color: "#fff", marginLeft: 4, fontSize: 12 },
  detail: { color: "#fff", fontSize: 12, marginTop: 2 },
   bookmarkWrapper: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 6,
    borderRadius: 20,
  },
});
