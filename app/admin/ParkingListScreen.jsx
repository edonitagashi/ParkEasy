import React, { useEffect, useState, useCallback } from "react";
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

const ITEM_HEIGHT = 120;

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

  const fetchParkings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchParkings();
  }, [fetchParkings]);

  const openEdit = useCallback((item) => {
    setEditData({
      id: item.id,
      name: item.name,
      address: item.address,
      price: String(item.price),
      totalSpots: String(item.totalSpots),
    });
    setEditModal(true);
  }, []);

  const saveEdit = useCallback(async () => {
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
  }, [editData, fetchParkings]);

  const handleDelete = useCallback((id) => {
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
  }, [fetchParkings]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>Address: {item.address}</Text>
        <Text style={styles.text}>Price: {item.price} €</Text>
        <Text style={styles.text}>Spots: {item.freeSpots}/{item.totalSpots}</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
            <Text style={{ color: "#2E7D6A" }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
            <Text style={{ color: "#b02a37" }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [openEdit, handleDelete]
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
      <AdminBackHeader title="Manage Parkings" />

      <FlatList
        data={parkings}
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

      {/* Edit modal unchanged in behavior */}
      <Modal visible={editModal} transparent animationType="fade" onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Parking</Text>

            <TextInput
              style={styles.input}
              value={editData.name}
              onChangeText={(t) => setEditData((s) => ({ ...s, name: t }))}
              placeholder="Parking Name"
            />

            <TextInput
              style={styles.input}
              value={editData.address}
              onChangeText={(t) => setEditData((s) => ({ ...s, address: t }))}
              placeholder="Address"
            />

            <TextInput
              style={styles.input}
              value={editData.price}
              onChangeText={(t) => setEditData((s) => ({ ...s, price: t }))}
              keyboardType="numeric"
              placeholder="Price (€)"
            />

            <TextInput
              style={styles.input}
              value={editData.totalSpots}
              onChangeText={(t) => setEditData((s) => ({ ...s, totalSpots: t }))}
              keyboardType="numeric"
              placeholder="Total Spots"
            />

            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.save]} onPress={saveEdit}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={() => setEditModal(false)}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  row: { flexDirection: 'row', marginTop: 8 },
  iconBtn: { marginLeft: 12 },

  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2 },
  name: { fontSize: 16, fontWeight: '700' },
  text: { color: '#333', marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  save: { backgroundColor: "#2E7D6A" },
  cancel: { backgroundColor: "#b02a37" },
  btnText: { color: "#fff", fontWeight: "700" },
});