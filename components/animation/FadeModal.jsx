import React, { useEffect, useRef } from 'react';
import { Modal, Animated, StyleSheet, View, Pressable } from 'react-native';
import { theme } from '../../app/hooks/theme';

const { colors, radii, spacing, shadows, flex, zIndex } = theme;

export default function FadeModal({ 
  visible, 
  onClose, 
  children, 
  emphasize = false, 
  autoEmphasize = false 
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const [focused, setFocused] = React.useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 10, tension: 60, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.98, duration: 900, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View 
          style={[
            styles.container, 
            (emphasize || (autoEmphasize && focused)) && styles.containerFocused,
            { transform: [{ scale }] }
          ]}
        >
          {autoEmphasize
            ? React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;
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
    backgroundColor: colors.backdrop,
    ...flex.justifyContent.center,
    ...flex.alignItems.center,
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    width: '92%',
    maxWidth: 420,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  containerFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    elevation: 12,
  },
});