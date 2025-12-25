import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff, X } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useThemedColors } from '../hooks/useThemedColors';

export default function NetworkStatusBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const colors = useThemedColors();
  
  // Show banner if not connected or internet not reachable
  const showBanner = !isConnected || !isInternetReachable;
  
  const slideAnim = React.useRef(new Animated.Value(showBanner ? 0 : -100)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showBanner ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showBanner, slideAnim]);

  if (!showBanner) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: colors.status.error,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.bannerContent}>
        <WifiOff size={18} color={colors.text.white} />
        <Text style={[styles.bannerText, { color: colors.text.white }]}>
          No internet connection. Some features may not work.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Account for status bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

