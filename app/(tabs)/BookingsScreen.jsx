import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import theme from "../hooks/theme";
import AnimatedTouchable from "../../components/animation/AnimatedTouchable";
import { colors } from "../hooks/theme";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchHeader from "../../components/SearchHeader";
import TaskCompleteOverlay from "../../components/animation/TaskCompleteOverlay";

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doneVisible, setDoneVisible] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    if (auth.currentUser) {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid)
      );

      unsub = onSnapshot(
        q,
        (snapshot) => {
          let items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

          // Sort by newest first (using createdAt or date/time fallback)
          const getTime = (it) => {
            try {
              if (it.createdAt?.toDate) return it.createdAt.toDate().getTime();
              if (it.createdAt instanceof Date) return it.createdAt.getTime();
              if (it.date) {
                const base = new Date(it.date);
                if (it.time) {
                  const [h, m] = String(it.time).split(":");
                  base.setHours(parseInt(h || 0, 10), parseInt(m || 0, 10), 0, 0);
                }
                return base.getTime();
              }
            } catch {}
            return 0;
          };

          items = items.sort((a, b) => getTime(b) - getTime(a));

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

  const runDelete = async (bookingId) => {
    try {
      if (!bookingId) {
        Alert.alert("Error", "Booking ID missing.");
        return;
      }

    
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      await deleteDoc(doc(db, "bookings", bookingId));

      setDoneVisible(true);
      setTimeout(() => setDoneVisible(false), 1200);
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Delete Failed", err.message || "Unknown error");

  
    }
  };

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

  
  const getTotal = (duration) => {
    const hours = parseFloat(duration) || 0;
    return (hours * 5).toFixed(2); // $5 per hour
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <SearchHeader title="My Bookings" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.text }}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <SearchHeader title="My Bookings" />

      {bookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={60} color={colors.primary + "88"} />
          <Text style={styles.emptyText}>You have no bookings yet.</Text>
          <Text style={styles.emptySubText}>Start reserving parking spots!</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.lg }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Ionicons name="car-outline" size={24} color={colors.primary} />
                <Text style={styles.parkingName}>{item.parkingName}</Text>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.detailText}>{item.date}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.detailText}>{item.time}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="hourglass-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.detailText}>{item.duration} hours</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons
                    name={item.paymentMethod === "card" ? "card-outline" : "cash-outline"}
                    size={18}
                    color={item.paymentMethod === "card" ? colors.primary : "#2e7d32"}
                  />
                  <Text style={styles.detailText}>
                    {item.paymentMethod === "card" ? "Debit Card" : "Cash in Person"}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>${getTotal(item.duration)}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <AnimatedTouchable
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
                </AnimatedTouchable>

                <AnimatedTouchable
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}>Delete</Text>
                </AnimatedTouchable>
              </View>
            </View>
          )}
        />
      )}

      <TaskCompleteOverlay visible={doneVisible} message="Deleted!" />
    </SafeAreaView>
  );
}

/* --------- STYLES --------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },

  emptySubText: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
  },

  card: {
    backgroundColor: "#F3F8F7",
    padding: theme.spacing.lg + theme.spacing.xs,
    borderRadius: 16,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },

  parkingName: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: theme.spacing.sm,
  },

  details: {
    marginBottom: theme.spacing.md,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.xs,
  },

  detailText: {
    fontSize: 15.5,
    color: colors.text,
    marginLeft: theme.spacing.sm,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },

  editBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },

  deleteBtn: {
    backgroundColor: colors.danger || "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});