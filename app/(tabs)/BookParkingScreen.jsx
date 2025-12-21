import React, { useState } from "react";
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
} from "react-native";
import TaskCompleteOverlay from "../../components/animation/TaskCompleteOverlay";
import Message from "../hooks/Message";
import { colors, radii, spacing } from "../hooks/theme";

import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import FadeModal from "../../components/animation/FadeModal";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import AnimatedTouchable from "../../components/animation/AnimatedTouchable";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookParkingScreen() {
  const { id, name } = useLocalSearchParams();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [duration, setDuration] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [loading, setLoading] = useState(false);
  const [doneVisible, setDoneVisible] = useState(false);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const formatTime = (t) =>
    t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const pricePerHour = 5;
  const totalCost = duration && !isNaN(duration) && parseFloat(duration) > 0
    ? (parseFloat(duration) * pricePerHour).toFixed(2)
    : "0.00";

  const handleBooking = async () => {
    Keyboard.dismiss(); // Close keyboard before booking

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
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: auth.currentUser.uid,
        parkingId: id,
        parkingName: name,
        date: formatDate(date),
        time: formatTime(time),
        duration,
        paymentMethod,
        createdAt: new Date(),
      });

      // ... (your notification code remains exactly the same)

      setDoneVisible(true);
      setTimeout(() => {
        setDoneVisible(false);
        router.replace("/(tabs)/BookingsScreen");
      }, 1000);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Wrap everything to handle keyboard properly */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            <Text style={styles.subtitle}>{name}</Text>

            {/* DATE FIELD */}
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
                    <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 4, color: colors.pickerHeader }}>Select date</Text>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      themeVariant={Platform.OS === "ios" ? "light" : undefined}
                      textColor={Platform.OS === "ios" ? colors.pickerWheelText : undefined}
                      onChange={(e, selectedDate) => {
                        if (Platform.OS !== "ios") setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                      }}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <AnimatedTouchable
                        style={{
                          backgroundColor: colors.pickerDoneBg || colors.primary,
                          paddingVertical: 12,
                          borderRadius: radii.md,
                          alignItems: "center",
                        }}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={{ color: colors.pickerDoneText, fontWeight: "700" }}>Done</Text>
                      </AnimatedTouchable>
                    )}
                  </View>
                </FadeModal>
              </>
            )}

            {/* TIME FIELD */}
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

                <FadeModal visible={showTimePicker} onClose={() => setShowTimePicker(false)}>
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 4, color: colors.pickerHeader }}>Select time</Text>
                    <DateTimePicker
                      value={time}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      themeVariant={Platform.OS === "ios" ? "light" : undefined}
                      textColor={Platform.OS === "ios" ? colors.pickerWheelText : undefined}
                      onChange={(e, selectedTime) => {
                        if (Platform.OS !== "ios") setShowTimePicker(false);
                        if (selectedTime) setTime(selectedTime);
                      }}
                    />
                    {Platform.OS === "ios" && (
                      <AnimatedTouchable
                        style={{
                          backgroundColor: colors.pickerDoneBg || colors.primary,
                          paddingVertical: 12,
                          borderRadius: radii.md,
                          alignItems: "center",
                        }}
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Text style={{ color: colors.pickerDoneText, fontWeight: "700" }}>Done</Text>
                      </AnimatedTouchable>
                    )}
                  </View>
                </FadeModal>
              </>
            )}

            {/* DURATION FIELD - with returnKeyType="done" */}
            <View style={styles.input}>
              <View style={styles.iconRow}>
                <Ionicons name="hourglass-outline" size={20} color={colors.primary} />
                <TextInput
                  style={styles.textField}
                  placeholder="Duration (hours)"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  value={duration}
                  onChangeText={setDuration}
                  placeholderTextColor="#777"
                />
              </View>
            </View>

            {/* PAYMENT METHOD */}
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "cash" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod("cash")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={24}
                    color={paymentMethod === "cash" ? "#fff" : colors.primary}
                  />
                  <Text
                    style={[
                      styles.paymentText,
                      paymentMethod === "cash" && styles.paymentTextSelected,
                    ]}
                  >
                    Cash in Person
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === "card" && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod("card")}
                >
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={paymentMethod === "card" ? "#fff" : colors.primary}
                  />
                  <Text
                    style={[
                      styles.paymentText,
                      paymentMethod === "card" && styles.paymentTextSelected,
                    ]}
                  >
                    Debit Card
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === "cash" && (
                <View style={styles.cashMessageContainer}>
                  <Text style={styles.cashMessage}>
                    You will pay in cash when you arrive at the parking spot.
                  </Text>
                </View>
              )}

              {paymentMethod === "card" && (
                <View style={styles.cardMessageContainer}>
                  <Text style={styles.cardMessage}>
                    Payment in progress...
                  </Text>
                </View>
              )}
            </View>

            {/* TOTAL AMOUNT */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>${totalCost}</Text>
            </View>

            {/* SUBMIT - Now always tappable */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleBooking}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Saving..." : "Reserve Now"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <TaskCompleteOverlay
        visible={doneVisible}
        message={<Message icon="✔" text="Reserved!" color={colors.success} align="left" />}
      />
    </SafeAreaView>
  );
}

/* ---------- STYLES (only small adjustment for scroll) ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 40, // Extra space so button is not cut off
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },

  subtitle: { fontSize: 18, color: colors.primary, marginBottom: 20 },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginLeft: 10,
  },

  textField: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
    flex: 1,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: colors.textOnPrimary,
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

  paymentContainer: {
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  paymentOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  paymentTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },

  cashMessageContainer: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4caf50",
  },
  cashMessage: {
    fontSize: 15,
    color: "#2e7d32",
    textAlign: "center",
    fontWeight: "500",
  },

  cardMessageContainer: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardMessage: {
    fontSize: 15,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "500",
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
});