import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

const AnimatedItem = ({ children, index, trigger, delay = 100, duration = 500 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    cancelAnimation(opacity);
    cancelAnimation(translateY);
    opacity.value = 0;
    translateY.value = 30;

    const staggerDelay = index * delay;
    const config = { duration, easing: Easing.out(Easing.quad) };
    opacity.value = withDelay(staggerDelay, withTiming(1, config));
    translateY.value = withDelay(staggerDelay, withTiming(0, config));
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default AnimatedItem;
