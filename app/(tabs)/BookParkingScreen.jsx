import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import TaskCompleteOverlay from "../../components/animation/TaskCompleteOverlay";
import Message from "../hooks/Message";
import { colors, radii, spacing } from "../hooks/theme";

import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import FadeModal from "../../components/animation/FadeModal";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import AnimatedTouchable from "../../components/animation/AnimatedTouchable";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookParkingScreen() {
  const { id, name } = useLocalSearchParams();

  const [currentParking, setCurrentParking] = useState(null);
  const [parkingLoading, setParkingLoading] = useState(true);
  const [pricePerHour, setPricePerHour] = useState(5);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [doneVisible, setDoneVisible] = useState(false);

  useEffect(() => {
    const fetchParking = async () => {
      if (!id) {
        setParkingLoading(false);
        return;
      }

      try {
        setParkingLoading(true);
        const parkingRef = doc(db, "parkings", id);
        const parkingSnap = await getDoc(parkingRef);

        if (parkingSnap.exists()) {
          const parkingData = { id: parkingSnap.id, ...parkingSnap.data() };
          setCurrentParking(parkingData);

          const price = parkingData.price;
          const parsedPrice = price ? parseFloat(price.toString()) : 5;
          setPricePerHour(parsedPrice);
        } else {
          Alert.alert("Error", "Parking not found!");
          setPricePerHour(5);
        }
      } catch (error) {
        console.error("Error fetching parking:", error);
        Alert.alert("Error", "Failed to load parking details.");
        setPricePerHour(5);
      } finally {
        setParkingLoading(false);
      }
    };

    fetchParking();
  }, [id]);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const formatTime = (t) =>
    t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const totalCost =
    duration && !isNaN(duration) && parseFloat(duration) > 0
      ? (parseFloat(duration) * pricePerHour).toFixed(2)
      : "0.00";

  const handleBooking = async () => {
    Keyboard.dismiss();

    if (!auth.currentUser) {
      return Alert.alert("Error", "You must be logged in.");
    }
    if (!duration.trim()) {
      return Alert.alert("Error", "Duration is required.");
    }
    if (!paymentMethod) {
      return Alert.alert("Error", "Please select a payment method.");
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "bookings"), {
        userId: auth.currentUser.uid,
        parkingId: id,
        parkingName: name || currentParking?.name,
        date: formatDate(date),
        time: formatTime(time),
        duration: parseFloat(duration),
        paymentMethod,
        pricePerHour,
        totalCost: parseFloat(totalCost),
        createdAt: new Date(),
      });

      setDoneVisible(true);
      setTimeout(() => {
        setDoneVisible(false);
        router.replace("/(tabs)/BookingsScreen");
      }, 1500);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (parkingLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading parking details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Reserve Parking</Text>
            <Text style={styles.subtitle}>{name || "Parking Spot"}</Text>

            {/* Date Picker */}
            {Platform.OS === "web" ? (
              <View style={styles.input}>
                <View style={styles.iconRow}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
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
                <FadeModal visible={showDatePicker} onClose={() => setShowDatePicker(false)}>
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 4 }}>Select date</Text>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(e, selectedDate) => {
                        if (Platform.OS !== "ios") setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                      }}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <AnimatedTouchable
                        style={{
                          backgroundColor: colors.primary,
                          paddingVertical: 12,
                          borderRadius: radii.md,
                          alignItems: "center",
                        }}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>Done</Text>
                      </AnimatedTouchable>
                    )}
                  </View>
                </FadeModal>
              </>
            )}

            {/* Time Picker */}
            {Platform.OS === "web" ? (
              <View style={styles.input}>
                <View style={styles.iconRow}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <input
                    type="time"
                    value={formatTime(time)}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":");
                      const newTime = new Date();
                      newTime.setHours(parseInt(h));
                      newTime.setMinutes(parseInt(m));
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
                <FadeModal visible={showTimePicker} onClose={() => setShowTimePicker(false)}>
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 4 }}>Select time</Text>
                    <DateTimePicker
                      value={time}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(e, selectedTime) => {
                        if (Platform.OS !== "ios") setShowTimePicker(false);
                        if (selectedTime) setTime(selectedTime);
                      }}
                    />
                    {Platform.OS === "ios" && (
                      <AnimatedTouchable
                        style={{
                          backgroundColor: colors.primary,
                          paddingVertical: 12,
                          borderRadius: radii.md,
                          alignItems: "center",
                        }}
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>Done</Text>
                      </AnimatedTouchable>
                    )}
                  </View>
                </FadeModal>
              </>
            )}

            {/* Duration */}
            <View style={styles.input}>
              <View style={styles.iconRow}>
                <Ionicons name="hourglass-outline" size={20} color={colors.primary} />
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

            {/* Payment */}
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[styles.paymentOption, paymentMethod === "cash" && styles.paymentOptionSelected]}
                  onPress={() => setPaymentMethod("cash")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={paymentMethod === "cash" ? "#fff" : colors.primary}
                  />
                  <Text
                    style={[styles.paymentText, paymentMethod === "cash" && styles.paymentTextSelected]}
                  >
                    Cash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentOption, paymentMethod === "card" && styles.paymentOptionSelected]}
                  onPress={() => setPaymentMethod("card")}
                >
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={paymentMethod === "card" ? "#fff" : colors.primary}
                  />
                  <Text
                    style={[styles.paymentText, paymentMethod === "card" && styles.paymentTextSelected]}
                  >
                    Card
                  </Text>
                </TouchableOpacity>
              </View>
              {paymentMethod === "cash" && (
                <View style={styles.cashMessageContainer}>
                  <Text style={styles.cashMessage}>Pay cash when you arrive.</Text>
                </View>
              )}
              {paymentMethod === "card" && (
                <View style={styles.cardMessageContainer}>
                  <Text style={styles.cardMessage}>Payment will be processed.</Text>
                </View>
              )}
            </View>

            {/* Total */}
            <View style={styles.totalContainer}>
              <View>
                <Text style={styles.totalLabel}>Total ({duration || 0}h)</Text>
                <Text style={styles.totalSubLabel}>× ${pricePerHour}/hr</Text>
              </View>
              <Text style={styles.totalAmount}>${totalCost}</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleBooking}
              disabled={loading || !duration.trim()}
            >
              <Text style={styles.buttonText}>
                {loading ? "Saving..." : `Reserve Now ($${totalCost})`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <TaskCompleteOverlay
        visible={doneVisible}
        message={<Message icon="✔" text="Parking Reserved!" color={colors.success} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.text },
  scrollContent: {
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 40,
  },
  title: { fontSize: 26, fontWeight: "bold", color: colors.primary, marginBottom: 5 },
  subtitle: { fontSize: 18, color: colors.primary, marginBottom: 20 },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#F8F8F8",
  },
  iconRow: { flexDirection: "row", alignItems: "center" },
  inputText: { fontSize: 16, color: colors.text, marginLeft: 10 },
  textField: { fontSize: 16, color: colors.text, marginLeft: 10, flex: 1 },
  webInput: { flex: 1, borderWidth: 0, fontSize: 16, marginLeft: 10, backgroundColor: "transparent" },

  paymentContainer: { marginBottom: 20 },
  paymentLabel: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 10 },
  paymentOptions: { flexDirection: "row", justifyContent: "space-between" },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: "#F8F8F8",
    marginHorizontal: 6,
  },
  paymentOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  paymentText: { fontSize: 16, color: colors.text, marginLeft: 12 },
  paymentTextSelected: { color: "#fff", fontWeight: "600" },

  cashMessageContainer: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4caf50",
  },
  cashMessage: { fontSize: 15, color: "#2e7d32", textAlign: "center", fontWeight: "500" },
  cardMessageContainer: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardMessage: { fontSize: 15, color: colors.primary, textAlign: "center", fontWeight: "500" },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    marginBottom: 24,
  },
  totalLabel: { fontSize: 18, fontWeight: "600", color: colors.text },
  totalSubLabel: { fontSize: 14, color: "#666", marginTop: 2 },
  totalAmount: { fontSize: 32, fontWeight: "bold", color: colors.primary },

  button: { backgroundColor: colors.primary, padding: 18, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});