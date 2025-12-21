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

      
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      await deleteDoc(doc(db, "bookings", bookingId));

      console.log("deleteDoc succeeded for:", bookingId);
      setDoneVisible(true);
      setTimeout(() => setDoneVisible(false), 1200);
    } catch (err) {
      console.error("Delete error:", err);
      const code = err?.code || "unknown";
      const msg = err?.message || String(err);
    
      Alert.alert(
        "Delete failed",
        `${code}\n${msg}`,
        [{ text: "OK" }]
      );

    
      if (code === "permission-denied") {
        Alert.alert(
          "Permission denied",
          "Your Firestore rules prevent deleting this document. Check that `userId` matches the signed-in user or update rules.",
          [{ text: "OK" }]
        );
      }

    
      loadBookings();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <SearchHeader title="My Bookings" />
        
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10 }}>Loading bookings...</Text>
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
          <Ionicons name="calendar-outline" size={50} color={colors.primary} />
          <Text style={styles.emptyText}>You have no bookings yet.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: theme.spacing.lg }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Ionicons name="car-outline" size={20} color={colors.primary} />
                  <Text style={styles.parkingName}>{item.parkingName}</Text>
                  {/* booking id hidden in UI */}
                </View>

                <Text style={styles.info}> {item.date}</Text>
                <Text style={styles.info}> {item.time}</Text>
                <Text style={styles.info}> {item.duration} hours</Text>

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
                    <Ionicons name="create-outline" size={18} color={theme.colors.textOnPrimary} />
                    <Text style={styles.btnText}>Edit</Text>
                  </AnimatedTouchable>

                  <AnimatedTouchable
                    style={styles.deleteBtn}
                    onPress={() => runDelete(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.textOnPrimary} />
                    <Text style={styles.btnText}>Delete</Text>
                  </AnimatedTouchable>
                </View>
              </View>
            )}
          />
          <TaskCompleteOverlay visible={doneVisible} message="Deleted" />
        </>
      )}
    </SafeAreaView>
  );
}

/* --------- STYLES --------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyBox: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    marginTop: theme.spacing.md - 2,
    fontSize: 16,
    color: colors.textMuted,
  },

  card: {
    backgroundColor: "#F3F8F7",
    padding: theme.spacing.lg + theme.spacing.xs,
    borderRadius: 14,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md - 2,
  },

  parkingName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: theme.spacing.sm - 2,
  },

  info: {
    fontSize: 15,
    color: colors.text,
    marginTop: theme.spacing.sm - theme.spacing.xs,
  },

  actions: {
    flexDirection: "row",
    marginTop: theme.spacing.lg - theme.spacing.xs,
  },

  editBtn: {
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 10,
    marginRight: theme.spacing.md - 2,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm - 2,
  },

  deleteBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm - 2,
  },

  btnText: {
    color: theme.colors.textOnPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
});
