import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  // Load list of bookings for current user
  const loadBookings = async () => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setBookings(items);
    } catch (err) {
      Alert.alert("Error", "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  // Delete booking
  const handleDelete = (bookingId) => {
    Alert.alert("Delete Booking", "Are you sure you want to delete this booking?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "bookings", bookingId));
          loadBookings();
        },
      },
    ]);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
        <Text style={{ marginTop: 10 }}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      {bookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={50} color="#2E7D6A" />
          <Text style={styles.emptyText}>You have no bookings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Ionicons name="car-outline" size={20} color="#2E7D6A" />
                <Text style={styles.parkingName}>{item.parkingName}</Text>
              </View>

              <Text style={styles.info}>Date: {item.date}</Text>
              <Text style={styles.info}>Time: {item.time}</Text>
              <Text style={styles.info}>Duration: {item.duration} hours</Text>

              <View style={styles.actions}>
                {/* EDIT BUTTON */}
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/EditBookingScreen",
                      params: { bookingId: item.id },
                    })
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>

                {/* DELETE BUTTON */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2E7D6A",
    marginBottom: 20,
  },

  emptyBox: {
    marginTop: 60,
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#777",
  },

  card: {
    backgroundColor: "#F3F8F7",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#CDE6DC",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  parkingName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D6A",
    marginLeft: 6,
  },

  info: {
    fontSize: 15,
    color: "#333",
    marginTop: 3,
  },

  actions: {
    flexDirection: "row",
    marginTop: 15,
  },

  editBtn: {
    backgroundColor: "#2E7D6A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  deleteBtn: {
    backgroundColor: "#b02a37",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
