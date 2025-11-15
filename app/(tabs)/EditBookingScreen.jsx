import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useLocalSearchParams, router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export default function EditBookingScreen() {
  const { bookingId } = useLocalSearchParams();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadBooking();
  }, []);

  // Load existing booking
  const loadBooking = async () => {
    try {
      const ref = doc(db, "bookings", bookingId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setDate(new Date(data.date));
        setTime(new Date(`${data.date}T${data.time}`));
        setDuration(String(data.duration));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load booking info.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d.toISOString().split("T")[0];
  const formatTime = (t) =>
    t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const handleUpdate = async () => {
    if (!duration.trim()) {
      return Alert.alert("Error", "Duration is required.");
    }

    setSaving(true);

    try {
      const ref = doc(db, "bookings", bookingId);

      await updateDoc(ref, {
        date: formatDate(date),
        time: formatTime(time),
        duration,
      });

      Alert.alert("Success", "Booking updated successfully!");
      router.push("/(tabs)/BookingsScreen");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
        <Text style={{ marginTop: 10 }}>Loading booking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Booking</Text>

      {/* Date */}
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <View style={styles.iconRow}>
          <Ionicons name="calendar-outline" size={20} color="#2E7D6A" />
          <Text style={styles.inputText}>{formatDate(date)}</Text>
        </View>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(e, d) => {
            setShowDatePicker(false);
            if (d) setDate(d);
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Time */}
      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <View style={styles.iconRow}>
          <Ionicons name="time-outline" size={20} color="#2E7D6A" />
          <Text style={styles.inputText}>{formatTime(time)}</Text>
        </View>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          onChange={(e, t) => {
            setShowTimePicker(false);
            if (t) setTime(t);
          }}
        />
      )}

      {/* Duration */}
      <View style={styles.input}>
        <View style={styles.iconRow}>
          <Ionicons name="hourglass-outline" size={20} color="#2E7D6A" />
          <TextInput
            style={styles.textField}
            placeholder="Duration (hours)"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholderTextColor="#777"
          />
        </View>
      </View>

      {/* Save Changes */}
      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.7 }]}
        onPress={handleUpdate}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: "#FFF" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D6A",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#F8F8F8",
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  inputText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },

  textField: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },

  button: {
    backgroundColor: "#2E7D6A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
