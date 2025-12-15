import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import theme from '../theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function TaskCompleteOverlay({ visible, message = 'Done' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 10, tension: 60 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.96, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.backdrop, { opacity }]}> 
      <Animated.View style={[styles.box, { transform: [{ scale }] }]}> 
        <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  box: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  text: { marginTop: 8, fontWeight: '700', color: '#111827' },
});
