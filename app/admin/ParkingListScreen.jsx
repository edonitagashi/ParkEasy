// app/admin/ParkingListScreen.jsx
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
import { db } from "../firebase/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "expo-router";
import AdminBackHeader from "../../components/AdminBackHeader";

export default function ParkingListScreen() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchParkings = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "parkings"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setParkings(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load parkings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const openReservations = (parkingId, name) => {
  router.push(`/admin/ParkingReservationsScreen?parkingId=${parkingId}&name=${name}`);
};


  const handleDeleteParking = async (id) => {
    try {
      await deleteDoc(doc(db, "parkings", id));
      fetchParkings();
    } catch {
      Alert.alert("Error", "Failed to delete parking.");
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
      <AdminBackHeader title="Parkings" />

      {parkings.length === 0 ? (
        <View style={styles.center}>
          <Text>No parkings found.</Text>
        </View>
      ) : (
        <FlatList
          data={parkings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.text}>Address: {item.address}</Text>
              <Text style={styles.text}>
                Spots: {item.freeSpots}/{item.totalSpots}
              </Text>
              <Text style={styles.text}>Price: {item.price} €</Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.btn, styles.primary]}
                  onPress={() => openReservations(item.id, item.name)}
                >
                  <Text style={styles.btnText}>Reservations</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.danger]}
                  onPress={() => handleDeleteParking(item.id)}
                >
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

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#E9F8F6" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderColor: "#CDEDE7",
    borderWidth: 1,
  },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  text: { color: "#555" },
  row: { flexDirection: "row", marginTop: 8, gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  primary: { backgroundColor: "#2E7D6A" },
  danger: { backgroundColor: "#d9534f" },
  btnText: { color: "#fff", fontWeight: "600" },
});
