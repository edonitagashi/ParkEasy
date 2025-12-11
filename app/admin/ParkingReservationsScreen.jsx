import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import AdminBackHeader from "../../components/AdminBackHeader";

const ITEM_HEIGHT = 120;

export default function ParkingReservationsScreen() {
  const { parkingId, name } = useLocalSearchParams();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "bookings"),
        where("parkingId", "==", parkingId)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReservations(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }, [parkingId]);

  useEffect(() => {
    if (parkingId) fetchReservations();
  }, [parkingId, fetchReservations]);

  const handleDeleteReservation = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, "bookings", id));
      fetchReservations();
    } catch {
      Alert.alert("Error", "Failed to delete.");
    }
  }, [fetchReservations]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.text}>User ID: {item.userId}</Text>
        <Text style={styles.text}>Date: {item.date}</Text>
        <Text style={styles.text}>Time: {item.time}</Text>
        <Text style={styles.text}>Duration: {item.duration} hours</Text>

        <TouchableOpacity style={[styles.btn, styles.danger]} onPress={() => handleDeleteReservation(item.id)}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleDeleteReservation]
  );

  const getItemLayout = useCallback((_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }), []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
      </View>
    );

  return (
    <View style={styles.container}>
      <AdminBackHeader title="Reservations" />

      <Text style={styles.title}>Reservations for {name}</Text>

      {reservations.length === 0 ? (
        <View style={styles.center}>
          <Text>No reservations found.</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={9}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#E9F8F6" },
  title: {
    marginTop: 10,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D6A",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  text: { color: "#333", marginTop: 4 },
  btn: { marginTop: 8, padding: 8, borderRadius: 8, alignItems: "center" },
  danger: { backgroundColor: "#b02a37" },
  btnText: { color: "#fff", fontWeight: "700" },
});