import React, { useEffect, useCallback } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { Calculator, BarChart3, TrendingUp } from "lucide-react-native"
import { useThemedColors } from '../../hooks/useThemedColors'
import { useTheme } from '../../contexts/ThemeContext'
import ModalCloseButton from "../ModalCloseButton"
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { MODAL_LAYOUT } from "../../constants/modal"

export default function VolumeCalculationInfoModal({ visible, onClose }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const screenHeight = Dimensions.get("window").height;
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

  // Define close function in RN Runtime scope (required for scheduleOnRN)
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward swipes (positive translationY)
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SWIPE_THRESHOLD) {
        // Swipe exceeded threshold, animate out then close modal
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
          'worklet';
          scheduleOnRN(handleClose);
        });
      } else {
        // Snap back to original position
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Animated style for drag handle that changes color when swiping
  const dragHandleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateY.value,
      [0, 50, 100],
      [colors.border.light, colors.primary[400], colors.primary[600]]
    );
    return {
      backgroundColor,
    };
  });

  // Reset translateY when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[
              { 
                backgroundColor: colors.background.card, 
                borderRadius: MODAL_LAYOUT.borderRadius,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
                maxHeight: screenHeight * 0.9, 
                minHeight: screenHeight * 0.8 
              },
              animatedStyle
            ]}>
              {/* Drag Handle */}
              <Animated.View style={[
                { 
                  width: 48, 
                  height: 4, 
                  borderRadius: 2, 
                  alignSelf: "center", 
                  marginTop: 12, 
                  marginBottom: 16 
                },
                dragHandleAnimatedStyle
              ]} />

              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "space-between", 
                paddingHorizontal: 24, 
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border.light,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.primary[100]
                    }}
                  >
                    <BarChart3 size={20} color={colors.primary[600]} />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                    Volume Calculation
                  </Text>
                </View>
                <ModalCloseButton onPress={onClose} />
              </View>

              <ScrollView 
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: colors.text.secondary }}>
                    Training volume is calculated by multiplying the weight lifted by the number of repetitions for each set, then summing all sets for the day.
                  </Text>

                  <View
                    style={{ 
                      padding: 16, 
                      borderRadius: 12, 
                      borderWidth: 2, 
                      marginBottom: 16,
                      backgroundColor: colors.primary[50], 
                      borderColor: colors.primary[200] 
                    }}
                  >
                    <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 18, color: colors.primary[800] }}>
                      Volume = Weight × Reps
                    </Text>
                    <Text style={{ textAlign: 'center', fontSize: 14, marginTop: 4, color: colors.primary[700] }}>
                      (per individual set)
                    </Text>
                  </View>

                  <View
                    style={{ 
                      padding: 16, 
                      borderRadius: 12, 
                      borderWidth: 2,
                      backgroundColor: colors.background.primary, 
                      borderColor: colors.border.light 
                    }}
                  >
                    <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 18, color: colors.text.primary }}>
                      Daily Total = Sum of all set volumes
                    </Text>
                  </View>
                </View>

                <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.text.primary }}>
                    Example Calculation
                  </Text>
                  <View style={{ borderRadius: 12, padding: 16, backgroundColor: colors.background.primary }}>
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text.primary }}>
                        Exercise: Bench Press
                      </Text>
                      <View style={{ marginLeft: 16 }}>
                        <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>Set 1: 50kg × 10 reps = 500kg</Text>
                        <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>Set 2: 50kg × 8 reps = 400kg</Text>
                        <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>Set 3: 50kg × 6 reps = 300kg</Text>
                      </View>
                    </View>

                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text.primary }}>
                        Exercise: Squats
                      </Text>
                      <View style={{ marginLeft: 16 }}>
                        <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>Set 1: 60kg × 12 reps = 720kg</Text>
                        <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>Set 2: 60kg × 10 reps = 600kg</Text>
                      </View>
                    </View>

                    <View style={{ borderTopWidth: 1, paddingTop: 12, marginTop: 12, borderTopColor: colors.border.light }}>
                      <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 18, color: colors.primary[600] }}>
                        Daily Total: 2,520kg
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.text.primary }}>
                    Why This Matters
                  </Text>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: 12, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginRight: 12, 
                        marginTop: 2,
                        backgroundColor: colors.primary[100] 
                      }}>
                        <TrendingUp size={14} color={colors.primary[600]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', color: colors.text.primary }}>Training Load</Text>
                        <Text style={{ fontSize: 14, color: colors.text.secondary }}>Measures total work performed</Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: 12, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginRight: 12, 
                        marginTop: 2,
                        backgroundColor: colors.primary[100] 
                      }}>
                        <Calculator size={14} color={colors.primary[600]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600', color: colors.text.primary }}>Progress Tracking</Text>
                        <Text style={{ fontSize: 14, color: colors.text.secondary }}>Helps monitor strength gains over time</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={{ 
                paddingHorizontal: 24, 
                paddingBottom: 32, 
                paddingTop: 16, 
                borderTopWidth: 1, 
                borderTopColor: colors.border.light 
              }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{ 
                    paddingVertical: 16, 
                    borderRadius: 12, 
                    backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                  }}
                >
                  <Text style={{ 
                    textAlign: 'center', 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: 16 
                  }}>
                    Got it!
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
