// app/admin/ParkingRequestsScreen.jsx
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
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import AdminBackHeader from "../../components/AdminBackHeader";

export default function ParkingRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "parkingRequests"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(data);
    } catch {
      Alert.alert("Error", "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (item) => {
    try {
      const parkingRef = doc(collection(db, "parkings"));
      await setDoc(parkingRef, {
        ownerId: item.ownerId,
        name: item.name,
        address: item.address,
        price: item.price,
        totalSpots: item.totalSpots,
        freeSpots: item.totalSpots,
        status: "open",
        createdAt: new Date(),
      });

      await deleteDoc(doc(db, "parkingRequests", item.id));
      fetchRequests();
    } catch {
      Alert.alert("Error", "Failed to accept request.");
    }
  };

  const handleReject = async (item) => {
    try {
      await deleteDoc(doc(db, "parkingRequests", item.id));
      fetchRequests();
    } catch {
      Alert.alert("Error", "Failed to reject.");
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
      <AdminBackHeader title="Requests" />

      {requests.length === 0 ? (
        <View style={styles.center}>
          <Text>No pending requests.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.text}>Owner: {item.ownerEmail}</Text>
              <Text style={styles.text}>Address: {item.address}</Text>
              <Text style={styles.text}>Spots: {item.totalSpots}</Text>
              <Text style={styles.text}>Price: {item.price} €</Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.btn, styles.accept]}
                  onPress={() => handleAccept(item)}
                >
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.reject]}
                  onPress={() => handleReject(item)}
                >
                  <Text style={styles.btnText}>Reject</Text>
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#CDEDE7",
  },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  text: { fontSize: 14, color: "#555" },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  accept: { backgroundColor: "#2E7D6A" },
  reject: { backgroundColor: "#d9534f" },
  btnText: { color: "#fff", fontWeight: "600" },
});
