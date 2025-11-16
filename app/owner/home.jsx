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
        <ActivityIndicator size="large" color="#2E7D6A" />
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
        <Text style={[styles.title, { color: "#c0392b" }]}>Request Rejected</Text>
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
  container: { flex: 1, padding: 20, backgroundColor: "#E9F8F6" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D6A",
    marginVertical: 10,
    textAlign: "center",
  },
  msg: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 20 },

  parkingCard: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#CDEDE7",
  },
  pTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D6A" },
  pText: { color: "#555", marginTop: 4 },

  editBtn: {
    marginTop: 12,
    backgroundColor: "#2E7D6A",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  editText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CDEDE7",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D6A",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  save: { backgroundColor: "#2E7D6A" },
  cancel: { backgroundColor: "#d9534f" },
  btnText: { color: "#fff", fontWeight: "700" },
});
