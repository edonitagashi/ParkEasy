import React, { useEffect, useRef } from 'react';
import { Modal, Animated, StyleSheet, View, Pressable } from 'react-native';
import theme, { colors, radii, spacing, shadows } from '../theme';

export default function FadeModal({ visible, onClose, children, emphasize = false, autoEmphasize = false }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const [focused, setFocused] = React.useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 10, tension: 60 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.98, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.container, (emphasize || (autoEmphasize && focused)) && styles.containerFocused, { transform: [{ scale }] }]}>
          {autoEmphasize
            ? React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;
                // Attach focus/blur where available (TextInput, Picker-like components)
                const onFocus = (e) => {
                  setFocused(true);
                  child.props.onFocus?.(e);
                };
                const onBlur = (e) => {
                  setFocused(false);
                  child.props.onBlur?.(e);
                };
                return React.cloneElement(child, { onFocus, onBlur });
              })
            : children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.pickerBackdrop ,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    width: '92%',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: shadows.card.shadowColor,
    shadowOpacity: shadows.card.shadowOpacity,
    shadowRadius: shadows.card.shadowRadius,
    shadowOffset: shadows.card.shadowOffset,
    elevation: 8,
    // optional focus/outline glow leveraging theme tokens
    // note: to enable, merge styles.containerFocused into container when needed
  },
  containerFocused: {
    borderColor: colors.borderStrong,
    // subtle brand outline via elevated shadow
    shadowColor: '#2E7D6A',
    shadowOpacity: 0.12,
    elevation: 10,
  },
});
