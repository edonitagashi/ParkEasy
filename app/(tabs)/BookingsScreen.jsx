import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // subscribe to real-time updates for this user's bookings
    let unsub = () => {};
    if (auth.currentUser) {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid)
      );
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          console.log("Realtime bookings update, count:", items.length);
          setBookings(items);
          setLoading(false);
        },
        (err) => {
          console.error("Bookings onSnapshot error:", err);
          Alert.alert("Error", "Could not load bookings.");
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }

    return () => unsub();
  }, []);

  const handleDelete = (bookingId) => {
    Alert.alert("Delete Booking", "Are you sure you want to delete this booking?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => runDelete(bookingId),
      },
    ]);
  };

  // perform actual delete with error handling and UI feedback
  const runDelete = async (bookingId) => {
    try {
      console.log("runDelete called for bookingId:", bookingId);

      if (!bookingId) {
        Alert.alert("Error", "Booking id missing.");
        return;
      }

      if (!auth || !auth.currentUser) {
        Alert.alert("Error", "You must be logged in to delete a booking.");
        return;
      }

      // optimistic UI: remove locally first for snappy UX
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      await deleteDoc(doc(db, "bookings", bookingId));

      console.log("deleteDoc succeeded for:", bookingId);
      Alert.alert("Deleted", "Booking removed successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      const code = err?.code || "unknown";
      const msg = err?.message || String(err);
      // Show detailed error to help debugging (permission, auth, etc.)
      Alert.alert(
        "Delete failed",
        `${code}\n${msg}`,
        [{ text: "OK" }]
      );

      // Helpful hint for common permission error
      if (code === "permission-denied") {
        Alert.alert(
          "Permission denied",
          "Your Firestore rules prevent deleting this document. Check that `userId` matches the signed-in user or update rules.",
          [{ text: "OK" }]
        );
      }

      // revert UI if delete failed: reload bookings from server
      loadBookings();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <SearchHeader title="My Bookings" />
        
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2E7D6A" />
          <Text style={{ marginTop: 10 }}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SearchHeader title="My Bookings" />

      

      {bookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={50} color="#2E7D6A" />
          <Text style={styles.emptyText}>You have no bookings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Ionicons name="car-outline" size={20} color="#2E7D6A" />
                <Text style={styles.parkingName}>{item.parkingName}</Text>
                {/* booking id hidden in UI */}
              </View>

              <Text style={styles.info}> {item.date}</Text>
              <Text style={styles.info}> {item.time}</Text>
              <Text style={styles.info}> {item.duration} hours</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push({
                      pathname: "EditBookingScreen",
                      params: { bookingId: item.id },
                    })
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => runDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

/* --------- STYLES --------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyBox: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 10,
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
    marginTop: 4,
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
