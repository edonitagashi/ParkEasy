import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { theme } from '../../app/hooks/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { colors, spacing, radii, typography, shadows, flex, zIndex } = theme;

export default function TaskCompleteOverlay({ visible, message = 'Done!' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      try { 
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
      } catch (e) {}
      
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 10, tension: 60, useNativeDriver: true }),
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
        {typeof message === 'string' ? <Text style={styles.text}>{message}</Text> : message}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
    ...flex.justifyContent.center,
    ...flex.alignItems.center,
    zIndex: zIndex.toast,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  text: {
    fontSize: typography.size.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textStrong,
  },
});