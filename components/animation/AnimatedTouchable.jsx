import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function AnimatedTouchable({ 
  children, 
  onPress, 
  disabled = false, 
  style 
}) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    opacity.value = withTiming(0.9, { duration: 150 });
  };

  const handlePressOut = () => {
    opacity.value = withTiming(1, { duration: 300 });
  };


  const { width, minWidth, maxWidth, ...restStyle } = (style || {});
  const pressableStyle = { width, minWidth, maxWidth };

  return (
    <Pressable 
      onPress={onPress} 
      disabled={disabled} 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut}
      style={pressableStyle}
    >
      <Animated.View style={[restStyle, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}