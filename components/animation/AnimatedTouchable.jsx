import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function AnimatedTouchable({ children, onPress, disabled = false, activeOpacity = 0.7, style }) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handlePressIn = () => {
    opacity.value = withTiming(activeOpacity, { duration: 220 });
  };

  const handlePressOut = () => {
    opacity.value = withTiming(1, { duration: 220 });
  };

  return (
    <Pressable onPress={onPress} disabled={disabled} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
