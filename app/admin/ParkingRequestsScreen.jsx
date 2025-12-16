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
<<<<<<< Updated upstream
import AnimatedTouchable from "../../components/animation/AnimatedTouchable";
import theme, { colors } from "../../components/theme";
import TaskCompleteOverlay from "../../components/animation/TaskCompleteOverlay";
import { db } from "../firebase/firebase";
=======
import { db } from "../../firebase/firebase";
>>>>>>> Stashed changes
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
  const [doneVisible, setDoneVisible] = useState(false);

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

      setDoneVisible(true);
      setTimeout(() => {
        setDoneVisible(false);
        fetchRequests();
      }, 900);
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

      setDoneVisible(true);
      setTimeout(() => {
        setDoneVisible(false);
        fetchRequests();
      }, 900);
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
          <AnimatedTouchable style={[styles.btn, styles.accept]} onPress={() => handleAccept(item)}>
            <Text style={styles.btnText}>Accept</Text>
          </AnimatedTouchable>

          <AnimatedTouchable style={[styles.btn, styles.reject]} onPress={() => handleReject(item)}>
            <Text style={styles.btnText}>Reject</Text>
          </AnimatedTouchable>
        </View>
      </View>
    ),
    [handleAccept, handleReject]
  );

  const getItemLayout = useCallback((_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }), []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
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
          contentContainerStyle={{ padding: theme.spacing.lg }}
          renderItem={renderItem}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={9}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
        />
      )}
      <TaskCompleteOverlay visible={doneVisible} message="Updated" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surface, padding: theme.spacing.md, borderRadius: 8, marginBottom: theme.spacing.md, elevation: 2 },
  name: { fontSize: 16, fontWeight: "700" },
  text: { color: colors.text, marginTop: theme.spacing.sm - theme.spacing.xs },
  actions: { flexDirection: "row", marginTop: theme.spacing.md - 2 },
  btn: { flex: 1, padding: theme.spacing.sm + theme.spacing.xs, borderRadius: 8, alignItems: "center", marginRight: theme.spacing.sm },
  accept: { backgroundColor: colors.primary },
  reject: { backgroundColor: colors.danger },
  btnText: { color: theme.colors.textOnPrimary, fontWeight: "700" },
});