import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AnimatedTouchable from "../../components/animation/AnimatedTouchable";
import theme from "../hooks/theme";
import { colors } from "../hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function AdminHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    parkings: 0,
    users: 0,
    owners: 0,
    requests: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const parkingsSnap = await getDocs(collection(db, "parkings"));
      const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "user")));
      const ownersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "owner")));
      const requestsSnap = await getDocs(collection(db, "parkingRequests"));

      setStats({
        parkings: parkingsSnap.size,
        users: usersSnap.size,
        owners: ownersSnap.size,
        requests: requestsSnap.size,
      });
    } catch (e) {
      console.log("Stats load error:", e);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>System Overview</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <View style={styles.statsWrap}>
          <StatCard label="Parkings" value={stats.parkings} icon="car" />
          <StatCard label="Users" value={stats.users} icon="person" />
          <StatCard label="Owners" value={stats.owners} icon="people" />
          <StatCard label="Requests" value={stats.requests} icon="mail" />
        </View>
      )}

      <Text style={styles.sectionTitle}>Management</Text>

      <MenuButton title="Manage Parkings" icon="car" color={theme.colors.primary} onPress={() => router.push("/admin/ParkingListScreen")} />

<MenuButton title="Parking Reservations" icon="calendar" color={theme.colors.accent} 
    onPress={() => router.push("/admin/ParkingListScreen")} />

<MenuButton title="Manage Users" icon="people" color={theme.colors.danger} 
    onPress={() => router.push("/admin/UserManagementScreen")} />

<MenuButton title="View Requests" icon="mail" color={theme.colors.secondary} 
    onPress={() => router.push("/admin/ParkingRequestsScreen")} />

    </View>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={26} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({ title, icon, color, onPress }) {
  return (
    <AnimatedTouchable style={[styles.menuBtn, { backgroundColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={theme.colors.pickerDoneText} />
      <Text style={styles.menuText}>{title}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg, backgroundColor: colors.surface },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: theme.spacing.md, color: colors.primary },
  statsWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm + theme.spacing.xs },
  statCard: {
    width: "47%",
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg + theme.spacing.xs,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: colors.primary, marginTop: theme.spacing.sm - 2 },
  statLabel: { color: colors.textMuted, fontSize: 13 },
  menuBtn: {
    paddingVertical: theme.spacing.lg,
    borderRadius: 12,
    marginTop: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm + theme.spacing.xs,
  },
  menuText: { color: theme.colors.pickerDoneText, fontWeight: "600", fontSize: 16 },
});
