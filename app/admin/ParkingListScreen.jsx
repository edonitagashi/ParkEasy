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
  Modal,
  TextInput,
} from "react-native";
import { db } from "../firebase/firebase";
import { collection, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import AdminBackHeader from "../../components/AdminBackHeader";

export default function ParkingListScreen() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state for editing
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    address: "",
    price: "",
    totalSpots: "",
  });

  const fetchParkings = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "parkings"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setParkings(data);
    } catch {
      Alert.alert("Error", "Failed to load parkings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const openEdit = (item) => {
    setEditData({
      id: item.id,
      name: item.name,
      address: item.address,
      price: String(item.price),
      totalSpots: String(item.totalSpots),
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(db, "parkings", editData.id), {
        name: editData.name,
        address: editData.address,
        price: Number(editData.price),
        totalSpots: Number(editData.totalSpots),
      });

      Alert.alert("Updated", "Parking updated successfully.");
      setEditModal(false);
      fetchParkings();
    } catch (err) {
      Alert.alert("Error", "Failed to update parking.");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete Parking", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "parkings", id));
            fetchParkings();
          } catch {
            Alert.alert("Error", "Failed to delete parking.");
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
      </View>
    );

  return (
    <View style={styles.container}>
      <AdminBackHeader title="Manage Parkings" />

      <FlatList
        data={parkings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.text}>Address: {item.address}</Text>
            <Text style={styles.text}>Price: {item.price} €</Text>
            <Text style={styles.text}>
              Spots: {item.freeSpots}/{item.totalSpots}
            </Text>

            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.edit]} onPress={() => openEdit(item)}>
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.danger]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* EDIT MODAL */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Parking</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editData.name}
              onChangeText={(t) => setEditData({ ...editData, name: t })}
            />

            <TextInput
              style={styles.input}
              placeholder="Address"
              value={editData.address}
              onChangeText={(t) => setEditData({ ...editData, address: t })}
            />

            <TextInput
              style={styles.input}
              placeholder="Price (€)"
              keyboardType="numeric"
              value={editData.price}
              onChangeText={(t) => setEditData({ ...editData, price: t })}
            />

            <TextInput
              style={styles.input}
              placeholder="Total Spots"
              keyboardType="numeric"
              value={editData.totalSpots}
              onChangeText={(t) => setEditData({ ...editData, totalSpots: t })}
            />

            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.btn, styles.edit]} onPress={saveEdit}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.danger]}
                onPress={() => setEditModal(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderColor: "#CDEDE7",
    borderWidth: 1,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  text: { color: "#555", marginTop: 4 },
  row: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  edit: { backgroundColor: "#2E7D6A" },
  danger: { backgroundColor: "#d9534f" },
  btnText: { color: "#fff", fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
    color: "#2E7D6A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  modalRow: { flexDirection: "row", gap: 10 },
});
