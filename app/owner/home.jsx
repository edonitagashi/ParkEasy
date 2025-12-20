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
  Image,
  Alert,
  Platform,
  InteractionManager,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import theme, { colors } from "../../components/theme";
import { auth, db } from "../../firebase/firebase";
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
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

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

  // Geocode address string to coordinates
  const geocodeAddress = async (address) => {
    try {
      const GOOGLE_MAPS_API_KEY = "AIzaSyBfKKqxdwPhgtE4T8YNxmWqSGhXXN3h2YU";
      const query = encodeURIComponent(address.trim());
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      return null;
    } catch (e) {
      console.error("Geocoding error:", e);
      return null;
    }
  };

  const openEditModal = () => {
    setEditName(parking.name);
    setEditPrice(String(parking.price));
    setEditSpots(String(parking.totalSpots));
    setEditVisible(true);
  };

  const saveEdit = async () => {
    try {
      // Validate inputs
      const trimmedName = editName.trim();
      const priceNum = parseFloat(editPrice);
      const spotsNum = parseInt(editSpots);

      if (!trimmedName) {
        Alert.alert("Validation Error", "Please enter a parking name");
        return;
      }

      if (isNaN(priceNum) || priceNum < 0) {
        Alert.alert("Validation Error", "Please enter a valid price");
        return;
      }

      if (isNaN(spotsNum) || spotsNum < 0) {
        Alert.alert("Validation Error", "Please enter a valid number of spots");
        return;
      }

      // Geocode address if parking has one (update from ownerRequests)
      let coordsUpdate = {};
      if (parking.address) {
        const coords = await geocodeAddress(parking.address);
        if (coords) {
          coordsUpdate = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            coordinate: coords,
          };
        }
      }

      await updateDoc(doc(db, "parkings", parking.id), {
        name: trimmedName,
        price: priceNum,
        totalSpots: spotsNum,
        ...coordsUpdate,
      });

      Alert.alert("Success", "Parking updated successfully!");
      setEditVisible(false);
      loadData();
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Could not update parking. Please try again.");
    }
  };

  const pickFromLibrary = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "We need access to your photos.");
          return;
        }
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        base64: true,
        quality: 0.3,
      });

      if (!res.canceled && res.assets?.length) {
        const base64Img = `data:image/jpg;base64,${res.assets[0].base64}`;
        await syncPhotoToFirestore(base64Img);
      }
    } catch (e) {
      console.error("Image pick error:", e);
      Alert.alert("Error", "The photo could not be selected.");
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert(
          "Not supported on web",
          "Camera works only on a physical device or emulator with Expo Go."
        );
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Permission to access camera is required!"
        );
        return;
      }

      const results = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        base64: true,
        quality: 0.5,
      });

      if (!results.canceled && results.assets?.length) {
        const base64Img = `data:image/jpg;base64,${results.assets[0].base64}`;
        await syncPhotoToFirestore(base64Img);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "The photo could not be taken.");
    }
  };

  const syncPhotoToFirestore = async (base64Img) => {
    try {
      if (!parking) return;

      await updateDoc(doc(db, "parkings", parking.id), {
        photoUri: base64Img,
      });

      // Update local state immediately
      setParking({ ...parking, photoUri: base64Img });
      setShowPhotoOptions(false);

      Alert.alert("Success", "Parking photo updated!");
    } catch (error) {
      console.log("Firestore photo error:", error);
      Alert.alert("Error", "Could not update parking photo.");
    }
  };

  const handleRemovePhoto = async () => {
    try {
      if (!parking) return;

      await updateDoc(doc(db, "parkings", parking.id), {
        photoUri: "",
      });

      // Update local state immediately
      setParking({ ...parking, photoUri: "" });
      setShowPhotoOptions(false);

      Alert.alert("Success", "Parking photo removed!");
    } catch (error) {
      console.error("Remove photo error:", error);
      Alert.alert("Error", "Could not remove parking photo.");
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
          {/* Parking Photo Section */}
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={() => setShowPhotoOptions(true)}
          >
            {parking.photoUri ? (
              <Image
                source={{ uri: parking.photoUri }}
                style={styles.parkingPhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="image-outline" size={48} color="#999" />
              </View>
            )}
            <View style={styles.photoOverlay}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

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
            <Text style={styles.modalTitle}>Edit Parking Details</Text>

            <Text style={styles.inputLabel}>Parking Name</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter parking name"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Price (€)</Text>
            <TextInput
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
              placeholder="Enter price"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Total Spots</Text>
            <TextInput
              style={styles.input}
              value={editSpots}
              onChangeText={setEditSpots}
              keyboardType="numeric"
              placeholder="Enter total spots"
              placeholderTextColor="#999"
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

      {/* Photo Options Bottom Sheet */}
      {showPhotoOptions && (
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity 
            style={styles.bottomSheetBackground}
            activeOpacity={1}
            onPress={() => setShowPhotoOptions(false)}
          />
          <View style={styles.bottomSheetContent}>
            <TouchableOpacity 
              style={styles.modalOption} 
              activeOpacity={0.7}
              onPress={() => {
                setShowPhotoOptions(false);
                InteractionManager.runAfterInteractions(() => {
                  pickFromLibrary();
                });
              }}
            >
              <Ionicons name="image" size={24} color={colors.primary} />
              <Text style={styles.modalOptionText}>Choose from library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              activeOpacity={0.7}
              onPress={() => {
                setShowPhotoOptions(false);
                InteractionManager.runAfterInteractions(() => {
                  takePhoto();
                });
              }}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            {parking.photoUri && (
              <TouchableOpacity 
                style={[styles.modalOption, styles.deleteOption]} 
                activeOpacity={0.7}
                onPress={() => {
                  setShowPhotoOptions(false);
                  InteractionManager.runAfterInteractions(() => {
                    handleRemovePhoto();
                  });
                }}
              >
                <Ionicons name="trash" size={24} color={colors.danger} />
                <Text style={[styles.modalOptionText, styles.deleteOptionText]}>Delete</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]}
              activeOpacity={0.7}
              onPress={() => {
                setShowPhotoOptions(false);
              }}
            >
              <Text style={styles.cancelOptionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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

  photoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },

  parkingPhoto: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },

  photoPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },

  photoOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: theme.spacing.sm + theme.spacing.xs,
    marginBottom: theme.spacing.md - 2,
    fontSize: 16,
    color: "#1b1b1b",
  },

  row: { flexDirection: "row", gap: theme.spacing.sm + theme.spacing.xs },
  btn: { flex: 1, paddingVertical: theme.spacing.sm + theme.spacing.xs, borderRadius: 10, alignItems: "center" },
  save: { backgroundColor: colors.primary },
  cancel: { backgroundColor: colors.danger },
  btnText: { color: colors.textOnPrimary, fontWeight: "700" },

  // Photo Options Bottom Sheet Styles
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },

  bottomSheetBackground: {
    flex: 1,
    width: '100%',
  },

  bottomSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 4,
    paddingTop: 6,
  },

  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  deleteOption: {
    borderBottomColor: '#F5F5F5',
  },

  modalOptionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    fontWeight: '500',
  },

  deleteOptionText: {
    color: colors.danger,
    fontWeight: '600',
  },

  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingVertical: 8,
    justifyContent: 'center',
  },

  cancelOptionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '600',
  },
});
