import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SearchResultItem({ item }) {
  return (
    <TouchableOpacity onPress={() => Alert.alert("Parking selected", item.name)}>
      <LinearGradient
        colors={["#5C8374", "#6FA48B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
    
        <Image source={item.image} style={styles.image} />

        <View style={styles.infoContainer}>
          <Text style={styles.bookingId}>Booking ID: {item.id}</Text>
          <Text style={styles.name}>{item.name}</Text>

          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.address}>{item.address}</Text>
          </View>
        </View>

        <Ionicons name="bookmark-outline" size={22} color="#fff" style={styles.bookmarkIcon} />
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
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  bookingId: {
    fontSize: 12,
    color: "#fff",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 12,
  },
  bookmarkIcon: {
    padding: 10,
  },
});
