// app/admin/ParkingReservationsScreen.jsx
import React, { useEffect, useState } from "react";
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

export default function ParkingReservationsScreen() {
  const { parkingId, name } = useLocalSearchParams();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "reservations"), where("parkingId", "==", parkingId));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReservations(data);
    } catch {
      Alert.alert("Error", "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parkingId) fetchReservations();
  }, [parkingId]);

  const handleDeleteReservation = async (id) => {
    try {
      await deleteDoc(doc(db, "reservations", id));
      fetchReservations();
    } catch {
      Alert.alert("Error", "Failed to delete.");
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>User: {item.userEmail}</Text>
              <Text style={styles.text}>From: {item.startTime}</Text>
              <Text style={styles.text}>To: {item.endTime}</Text>
              <Text style={styles.text}>Status: {item.status}</Text>

              <TouchableOpacity
                style={[styles.btn, styles.danger]}
                onPress={() => handleDeleteReservation(item.id)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
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
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#CDEDE7",
  },
  text: { color: "#555" },
  btn: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  danger: { backgroundColor: "#d9534f" },
  btnText: { color: "#fff", fontWeight: "600" },
});
