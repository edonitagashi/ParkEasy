import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useLocalSearchParams, router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function BookParkingScreen() {
  const { id, name } = useLocalSearchParams();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setTime(selectedTime);
    }
    setShowTimePicker(false);
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const handleReserve = async () => {
    if (!duration.trim()) {
      return Alert.alert("Error", "Please enter duration in hours.");
    }

    if (isNaN(duration) || parseInt(duration) <= 0) {
      return Alert.alert("Error", "Duration must be a valid positive number.");
    }

    if (!auth.currentUser) {
      return Alert.alert("Error", "You must be logged in.");
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "bookings"), {
        parkingId: id,
        parkingName: name,
        userId: auth.currentUser.uid,
        date: formatDate(date),
        time: formatTime(time),
        duration,
        createdAt: new Date(),
      });

      setSuccess("✔ Reservation created!");
      setTimeout(() => {
        setSuccess("");
        router.back(); // Go back to previous screen
      }, 2000);

    } catch (err) {
      Alert.alert("Error", err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading form...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reserve Parking</Text>
      <Text style={styles.subTitle}>{name}</Text>

      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.inputText}>📅 {formatDate(date)}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.inputText}>⏰ {formatTime(time)}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
          is24Hour={true}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Duration (hours)"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleReserve}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Confirm Reservation"}
        </Text>
      </TouchableOpacity>

      {success ? <Text style={styles.success}>{success}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#2E7D6A" },
  subTitle: { fontSize: 18, marginBottom: 20, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#2E7D6A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  success: {
    color: "#2E7D6A",
    textAlign: "center",
    fontWeight: "700",
    marginTop: 14,
  },
});
