import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { auth, db } from "../firebase/firebase";
import theme, { colors } from "../../components/theme";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function Home() {
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSpots, setEditSpots] = useState("");

  // LOAD USER EMAIL FOR EACH BOOKING
  const loadUserEmails = async (bookingList) => {
    const updatedBookings = [];

    for (const b of bookingList) {
      let email = "";
      try {
        const uSnap = await getDoc(doc(db, "users", b.userId));
        if (uSnap.exists()) {
          email = uSnap.data().email;
        }
      } catch {}

      updatedBookings.push({
        ...b,
        userEmail: email,
      });
    }

    return updatedBookings;
  };

  const loadData = async () => {
    const uRef = await getDoc(doc(db, "users", user.uid));
    const u = uRef.data();
    setUserData(u);

    if (u.ownerStatus === "approved") {
      const parkQuery = query(
        collection(db, "parkings"),
        where("ownerId", "==", user.uid)
      );
      const snap = await getDocs(parkQuery);

      if (!snap.empty) {
        const p = snap.docs[0];
        const parkingData = { id: p.id, ...p.data() };
        setParking(parkingData);

        // Load bookings
        const bookingSnap = await getDocs(
          query(collection(db, "bookings"), where("parkingId", "==", p.id))
        );

        const rawBookings = bookingSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const finalBookings = await loadUserEmails(rawBookings);
        setBookings(finalBookings);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = () => {
    setEditName(parking.name);
    setEditPrice(String(parking.price));
    setEditSpots(String(parking.totalSpots));
    setEditVisible(true);
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(db, "parkings", parking.id), {
        name: editName.trim(),
        price: Number(editPrice),
        totalSpots: Number(editSpots),
      });

      alert("Parking updated!");
      setEditVisible(false);
      loadData();
    } catch (err) {
      alert("Error updating parking");
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (userData.ownerStatus === "pending") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Request Pending</Text>
        <Text style={styles.msg}>Your request is being reviewed…</Text>
      </View>
    );
  }

  if (userData.ownerStatus === "rejected") {
    return (
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.danger }]}>Request Rejected</Text>
        <Text style={styles.msg}>Check Profile to resubmit.</Text>
      </View>
    );
  }

  // APPROVED
  return (
    <View style={styles.container}>

      {parking && (
        <View style={styles.parkingCard}>
          <Text style={styles.pTitle}>{parking.name}</Text>
          <Text style={styles.pText}>Address: {parking.address}</Text>
          <Text style={styles.pText}>Price: €{parking.price}</Text>
          <Text style={styles.pText}>
            Spots: {parking.freeSpots} / {parking.totalSpots}
          </Text>

          <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
            <Text style={styles.editText}>Edit Parking</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.title}>Your Parking Bookings</Text>

      {bookings.length === 0 ? (
        <Text style={styles.msg}>No bookings yet.</Text>
      ) : (
        <FlatList
          style={{ width: "100%" }}
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const dateTime = new Date(`${item.date}T${item.time}:00`);

            return (
              <View style={styles.card}>
                <Text>User: {item.userEmail}</Text>

                <Text>
                  Date: {dateTime.toLocaleDateString()}
                  {"\n"}
                  Time:{" "}
                  {dateTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                <Text>Duration: {item.duration} hours</Text>
              </View>
            );
          }}
        />
      )}

      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Parking</Text>

            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Parking Name"
            />

            <TextInput
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
              placeholder="Price (€)"
            />

            <TextInput
              style={styles.input}
              value={editSpots}
              onChangeText={setEditSpots}
              keyboardType="numeric"
              placeholder="Total Spots"
            />

            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.save]} onPress={saveEdit}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.cancel]}
                onPress={() => setEditVisible(false)}
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

//
// STYLES
//
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: theme.spacing.lg + theme.spacing.sm, backgroundColor: colors.background },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: theme.spacing.md - 2,
    textAlign: "center",
  },
  msg: { fontSize: 16, color: colors.textMuted, textAlign: "center", marginBottom: theme.spacing.xl - theme.spacing.sm },

  parkingCard: {
    backgroundColor: colors.surface,
    width: "100%",
    padding: theme.spacing.md + theme.spacing.xs,
    borderRadius: 12,
    marginBottom: theme.spacing.md + theme.spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  pTitle: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  pText: { color: colors.textMuted, marginTop: theme.spacing.sm - theme.spacing.xs },

  editBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  editText: { color: colors.textOnPrimary, fontWeight: "700" },

  card: {
    backgroundColor: colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md - 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: "center",
    padding: theme.spacing.lg + theme.spacing.sm,
  },
  modalBox: {
    backgroundColor: colors.surface,
    padding: theme.spacing.lg + theme.spacing.xs,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: theme.spacing.md,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: theme.spacing.sm + theme.spacing.xs,
    marginBottom: theme.spacing.md - 2,
  },

  row: { flexDirection: "row", gap: theme.spacing.sm + theme.spacing.xs },
  btn: { flex: 1, paddingVertical: theme.spacing.sm + theme.spacing.xs, borderRadius: 10, alignItems: "center" },
  save: { backgroundColor: colors.primary },
  cancel: { backgroundColor: colors.danger },
  btnText: { color: colors.textOnPrimary, fontWeight: "700" },
});
