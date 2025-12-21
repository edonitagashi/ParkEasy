import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import AnimatedTouchable from "../../components/animation/AnimatedTouchable";
import theme, { colors } from "../hooks/theme";
import TaskCompleteOverlay from "../../components/animation/TaskCompleteOverlay";
import { useLocalSearchParams } from "expo-router";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import AdminBackHeader from "../../components/AdminBackHeader";

const ITEM_HEIGHT = 120;

export default function ParkingReservationsScreen() {
  const { parkingId, name } = useLocalSearchParams();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doneVisible, setDoneVisible] = useState(false);

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
      setDoneVisible(true);
      setTimeout(() => {
        setDoneVisible(false);
        fetchReservations();
      }, 900);
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

        <AnimatedTouchable style={[styles.btn, styles.danger]} onPress={() => handleDeleteReservation(item.id)}>
          <Text style={styles.btnText}>Delete</Text>
        </AnimatedTouchable>
      </View>
    ),
    [handleDeleteReservation]
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
      <TaskCompleteOverlay visible={doneVisible} message="Deleted" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    marginTop: theme.spacing.md - 2,
    marginLeft: theme.spacing.lg,
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  text: { color: colors.text, marginTop: 4 },
  btn: { marginTop: theme.spacing.sm, padding: theme.spacing.sm, borderRadius: 8, alignItems: "center" },
  danger: { backgroundColor: colors.danger },
  btnText: { color: colors.textOnPrimary, fontWeight: "700" },
});