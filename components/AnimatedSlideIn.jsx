import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

const AnimatedSlideIn = ({ children, index, trigger, delay = 80, duration = 450 }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-40);

  useEffect(() => {
    cancelAnimation(opacity);
    cancelAnimation(translateX);
    opacity.value = 0;
    translateX.value = -40;

    const staggerDelay = index * delay;
    opacity.value = withDelay(
      staggerDelay,
      withTiming(1, { duration, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      staggerDelay,
      withSpring(0, { damping: 18, stiffness: 140, mass: 0.8 })
    );
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default AnimatedSlideIn;
