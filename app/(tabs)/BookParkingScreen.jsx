import React, { useState } from "react";
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

import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

export default function BookParkingScreen() {
  const { id, name } = useLocalSearchParams(); // parkingId + parkingName

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const formatTime = (t) =>
    t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const handleBooking = async () => {
    if (!auth.currentUser) {
      return Alert.alert("Error", "You must be logged in.");
    }

    if (!duration.trim()) {
      return Alert.alert("Error", "Duration is required.");
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "bookings"), {
        userId: auth.currentUser.uid,
        parkingId: id,            // fiks parking ID
        parkingName: name,        // emri i parkingut
        date: formatDate(date),
        time: formatTime(time),
        duration,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Parking booked successfully!");

      router.replace("/(tabs)/BookingsScreen");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reserve Parking</Text>
      <Text style={styles.subtitle}>{name}</Text>

      {/* DATE FIELD */}
      {Platform.OS === "web" ? (
        <View style={styles.input}>
          <View style={styles.iconRow}>
            <Ionicons name="calendar-outline" size={20} color="#2E7D6A" />
            <input
              type="date"
              value={formatDate(date)}
              onChange={(e) => setDate(new Date(e.target.value))}
              style={styles.webInput}
            />
          </View>
        </View>
      ) : (
        <>
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
              onChange={(e, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      {/* TIME FIELD */}
      {Platform.OS === "web" ? (
        <View style={styles.input}>
          <View style={styles.iconRow}>
            <Ionicons name="time-outline" size={20} color="#2E7D6A" />
            <input
              type="time"
              value={formatTime(time)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":");
                const newTime = new Date();
                newTime.setHours(h);
                newTime.setMinutes(m);
                setTime(newTime);
              }}
              style={styles.webInput}
            />
          </View>
        </View>
      ) : (
        <>
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
              onChange={(e, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}
        </>
      )}

      {/* DURATION FIELD */}
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

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleBooking}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Reserve Now"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: "#FFF" },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D6A",
    marginBottom: 5,
  },

  subtitle: { fontSize: 18, color: "#2E7D6A", marginBottom: 20 },

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

  webInput: {
    flex: 1,
    borderWidth: 0,
    fontSize: 16,
    marginLeft: 10,
    backgroundColor: "transparent",
  },
});