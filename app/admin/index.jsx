import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db } from "../firebase/firebase";
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
        <ActivityIndicator color="#2E7D6A" size="large" />
      ) : (
        <View style={styles.statsWrap}>
          <StatCard label="Parkings" value={stats.parkings} icon="car" />
          <StatCard label="Users" value={stats.users} icon="person" />
          <StatCard label="Owners" value={stats.owners} icon="people" />
          <StatCard label="Requests" value={stats.requests} icon="mail" />
        </View>
      )}

      <Text style={styles.sectionTitle}>Management</Text>

      <MenuButton title="Manage Parkings" icon="car" color="#2E7D6A" onPress={() => router.push("/admin/ParkingListScreen")} />

<MenuButton title="Parking Reservations" icon="calendar" color="#6C63FF" 
    onPress={() => router.push("/admin/ParkingListScreen")} />

<MenuButton title="Manage Users" icon="people" color="#FF6B6B" 
    onPress={() => router.push("/admin/UserManagementScreen")} />

<MenuButton title="View Requests" icon="mail" color="#4ECDC4" 
    onPress={() => router.push("/admin/ParkingRequestsScreen")} />

    </View>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={26} color="#2E7D6A" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({ title, icon, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.menuBtn, { backgroundColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#fff" />
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#2E7D6A" },
  statsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    backgroundColor: "#f9f9f9",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#2E7D6A", marginTop: 6 },
  statLabel: { color: "#555", fontSize: 13 },
  menuBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  menuText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
