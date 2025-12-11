import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Text } from 'react-native';
import { auth, db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AdminBackHeader from "../../components/AdminBackHeader";

const ITEM_HEIGHT = 72;

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = collection(db, 'users');
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Fetch users error', e);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = useCallback(async (u) => {
    try {
      const newStatus = u.status === 'inactive' ? 'active' : 'inactive';
      await updateDoc(doc(db, 'users', u.id), { status: newStatus });
      fetchUsers();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }, [fetchUsers]);

  const removeUser = useCallback((u) => {
    Alert.alert('Delete user', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', u.id));
            fetchUsers();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  }, [fetchUsers]);

  const keyExtractor = useCallback((item) => item.id, []);
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.name || item.fullName || item.email}
          </Text>
          <Text style={styles.meta}>
            {item.email} · {item.role}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => toggleStatus(item)}>
          <Ionicons
            name={item.status === 'inactive' ? 'close-circle' : 'checkmark-circle'}
            size={20}
            color={item.status === 'inactive' ? '#ff6b6b' : '#2E7D6A'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => removeUser(item)}>
          <MaterialIcons name="delete" size={20} color="#b02a37" />
        </TouchableOpacity>
      </View>
    ),
    [toggleStatus, removeUser]
  );

  const getItemLayout = useCallback((_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }), []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminBackHeader title="User Management" />

      <FlatList
        data={users}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 12 }}
        renderItem={renderItem}
        initialNumToRender={8}
        maxToRenderPerBatch={12}
        windowSize={11}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconBtn: { marginLeft: 12 },

  name: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#666', marginTop: 2 },
});