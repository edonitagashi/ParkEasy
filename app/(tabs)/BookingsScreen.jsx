import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!auth.currentUser) {
          Alert.alert("Error", "You must be logged in to view bookings.");
          return;
        }

        const q = query(
          collection(db, "bookings"),
          where("userId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        Alert.alert("Error", "Could not load bookings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading bookings...</Text>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="calendar-outline" size={64} color="#2E7D6A" />
        <Text style={styles.emptyText}>No bookings yet</Text>
        <Text style={styles.emptySubText}>Reserve a parking spot to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingCard}>
            <Text style={styles.parkingName}>{item.parkingName}</Text>
            <View style={styles.details}>
              <Text style={styles.detailText}>📅 {item.date}</Text>
              <Text style={styles.detailText}>⏰ {item.time}</Text>
              <Text style={styles.detailText}>⏱️ {item.duration} hours</Text>
            </View>
          </View>
        )}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9F8F6", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#2E7D6A", marginBottom: 20 },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D6A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parkingName: { fontSize: 18, fontWeight: "700", color: "#2E7D6A", marginBottom: 10 },
  details: { gap: 6 },
  detailText: { fontSize: 14, color: "#555", fontWeight: "500" },
  emptyText: { fontSize: 20, fontWeight: "700", color: "#2E7D6A", marginTop: 16 },
  emptySubText: { fontSize: 14, color: "#999", marginTop: 8 },
});
