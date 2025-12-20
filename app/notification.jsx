import React, { memo, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, FlatList, Text } from "react-native";
import * as Notifications from "expo-notifications";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const NotifCard = memo(({ item, onCancel }) => (
  <View style={styles.card}>
    <Text style={styles.titleText}>{item.title || "Notification"}</Text>
    {item.taskTitle && <Text style={styles.bodyText}>Task: {item.taskTitle}</Text>}
    {item.body && <Text style={styles.bodyText}>{item.body}</Text>}
    {item.scheduledAt && (
      <Text style={styles.time}>
        Scheduled: {(
          item.scheduledAt?.toDate ? item.scheduledAt.toDate() : new Date(item.scheduledAt)
        ).toLocaleString()}
      </Text>
    )}
    <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => onCancel(item)}>
      <Text style={styles.cancelText}>Cancel</Text>
    </TouchableOpacity>
  </View>
));

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", uid, "notifications");
    const q = query(ref, orderBy("scheduledAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setNotifs(list);
        setLoading(false);
      },
      (err) => {
        console.error("notifications onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const cancelNotification = useCallback(async (item) => {
    try {
      if (item.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(item.notificationId);
      }

      const uid = auth.currentUser?.uid;
      if (uid && item.id) {
        await updateDoc(doc(db, "users", uid, "notifications", item.id), {
          status: "cancelled",
          cancelledAt: new Date(),
        });
      }

      Alert.alert("Notification", "Cancelled successfully");
    } catch (e) {
      console.log("Cancel notification error", e);
      Alert.alert("Error", "Could not cancel notification");
    }
  }, []);

  const renderItem = useCallback(
    ({ item }) => <NotifCard item={item} onCancel={cancelNotification} />,
    [cancelNotification]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scheduled Notifications</Text>
      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No notifications yet.</Text> : null
        }
        maxToRenderPerBatch={5}
        initialNumToRender={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#E9F8F6" 
  },

  header: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#2E7D6A", 
    marginBottom: 12, 
    textAlign: "center"
  },

  card: { 
    padding: 12, 
    backgroundColor: "#F3F8F7", 
    borderRadius: 12, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CFE1DB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },

  titleText: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#2E7D6A" 
  },

  bodyText: { 
    marginTop: 6, 
    color: "#4C6E64", 
    fontSize: 14 
  },

  time: { 
    marginTop: 6, 
    color: "#4C6E64", 
    fontSize: 12 
  },

  cancelBtn: { 
    marginTop: 10, 
    paddingVertical: 10, 
    backgroundColor: "#b02a37", 
    borderRadius: 12, 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },

  cancelText: { 
    color: "white", 
    fontWeight: "700" 
  },

  empty: { 
    color: "#4C6E64", 
    textAlign: "center", 
    marginTop: 24, 
    fontWeight: "600" 
  }
});
