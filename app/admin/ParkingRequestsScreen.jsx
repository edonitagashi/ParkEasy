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
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import AdminBackHeader from "../../components/AdminBackHeader";

export default function ParkingRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH OWNER REQUESTS
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "ownerRequests")); // FIXED
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ACCEPT REQUEST
  const handleAccept = async (item) => {
    try {
      // 1. KRIJO PARKINGUN
      const parkingRef = doc(collection(db, "parkings"));
      await setDoc(parkingRef, {
        ownerId: item.userId,
        name: item.parkingName,
        address: item.address,
        price: item.price,
        totalSpots: item.totalSpots,
        freeSpots: item.totalSpots,
        status: "open",
        createdAt: new Date(),
      });

      // 2. UPDATE USER STATUS
      await updateDoc(doc(db, "users", item.userId), {
        ownerStatus: "approved",
      });

      // 3. FSHI REQUEST-IN
      await deleteDoc(doc(db, "ownerRequests", item.id));

      Alert.alert("Approved", "Parking request has been approved!");

      fetchRequests();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to approve request.");
    }
  };

  // REJECT REQUEST
  const handleReject = async (item) => {
    try {
      // në users → ownerStatus = rejected
      await updateDoc(doc(db, "users", item.userId), {
        ownerStatus: "rejected",
      });

      // fshi dokumentin e requestit
      await deleteDoc(doc(db, "ownerRequests", item.id));

      Alert.alert("Rejected", "Request has been rejected.");
      fetchRequests();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to reject request.");
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
      </View>
    );

  return (
    <View style={styles.container}>
      <AdminBackHeader title="Parking Requests" />

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
              <Text style={styles.name}>{item.parkingName}</Text>

              <Text style={styles.text}>Owner: {item.fullName}</Text>
              <Text style={styles.text}>Email: {item.email}</Text>
              <Text style={styles.text}>Phone: {item.phone}</Text>

              <Text style={styles.text}>Address: {item.address}</Text>
              <Text style={styles.text}>Spots: {item.totalSpots}</Text>
              <Text style={styles.text}>Price: €{item.price}</Text>

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

//
// STYLES
//
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#E9F8F6" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CDEDE7",
  },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  text: { fontSize: 14, color: "#555" },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  accept: { backgroundColor: "#2E7D6A" },
  reject: { backgroundColor: "#d9534f" },
  btnText: { color: "#fff", fontWeight: "700" },
});
