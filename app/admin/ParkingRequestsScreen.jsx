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

const ITEM_HEIGHT = 150;

export default function ParkingRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "ownerRequests"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRequests(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = useCallback(async (item) => {
    try {
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

      await updateDoc(doc(db, "users", item.userId), {
        ownerStatus: "approved",
      });

      await deleteDoc(doc(db, "ownerRequests", item.id));

      Alert.alert("Approved", "Parking request has been approved!");

      fetchRequests();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to approve request.");
    }
  }, [fetchRequests]);

  const handleReject = useCallback(async (item) => {
    try {
      await updateDoc(doc(db, "users", item.userId), {
        ownerStatus: "rejected",
      });

      await deleteDoc(doc(db, "ownerRequests", item.id));

      Alert.alert("Rejected", "Request has been rejected.");
      fetchRequests();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to reject request.");
    }
  }, [fetchRequests]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.name}>{item.parkingName}</Text>
        <Text style={styles.text}>{item.address}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.accept]} onPress={() => handleAccept(item)}>
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => handleReject(item)}>
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleAccept, handleReject]
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
      <AdminBackHeader title="Parking Requests" />

      {requests.length === 0 ? (
        <View style={styles.center}>
          <Text>No pending requests.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
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
  container: { flex: 1, backgroundColor: "#fff" },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2 },
  name: { fontSize: 16, fontWeight: "700" },
  text: { color: "#333", marginTop: 6 },
  actions: { flexDirection: "row", marginTop: 10 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center", marginRight: 8 },
  accept: { backgroundColor: "#2E7D6A" },
  reject: { backgroundColor: "#b02a37" },
  btnText: { color: "#fff", fontWeight: "700" },
});