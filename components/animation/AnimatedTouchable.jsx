import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, View } from 'react-native';

// Reusable press animation: fades content on press
export default function AnimatedTouchable({
  children,
  onPress,
  disabled = false,
  activeOpacity = 0.7,
  style,
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(opacity, {
      toValue: activeOpacity,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, { opacity }]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}
