import React, { useEffect, useCallback } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { Trophy, Calculator, TrendingUp, Target } from "lucide-react-native"
import { useThemedColors } from '../../hooks/useThemedColors'
import { useTheme } from '../../contexts/ThemeContext'
import ModalCloseButton from "../ModalCloseButton"
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"

export default function PersonalRecordsInfoModal({ visible, onClose }) {
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
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[
              { 
                backgroundColor: colors.background.card, 
                borderTopLeftRadius: 24, 
                borderTopRightRadius: 24,
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
                    <Trophy size={20} color={colors.primary[600]} />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                    Personal Records ?
                  </Text>
                </View>
                <ModalCloseButton onPress={onClose} />
              </View>

              <ScrollView 
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View style={{ paddingHorizontal: 24, marginTop: 24, marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: colors.text.secondary }}>
                    Personal Records show your best performance for each exercise, calculated using your One Repetition Maximum (1RM). The 1RM is the maximum weight you can lift for a single repetition.
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
                      1RM = Weight × (1 + Reps / 30)
                    </Text>
                    <Text style={{ textAlign: 'center', fontSize: 14, marginTop: 4, color: colors.primary[700] }}>
                      (Epley Formula)
                    </Text>
                  </View>

                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.text.primary }}>
                      Example Calculations
                    </Text>
                    <View style={{ borderRadius: 12, padding: 16, backgroundColor: colors.background.primary }}>
                      <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text.primary }}>
                          Example 1: Bench Press
                        </Text>
                        <View style={{ marginLeft: 16 }}>
                          <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>
                            Weight: 100kg × 5 reps
                          </Text>
                          <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>
                            1RM = 100 × (1 + 5/30)
                          </Text>
                          <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>
                            1RM = 100 × 1.167
                          </Text>
                          <Text style={{ fontWeight: 'bold', color: colors.primary[600], marginTop: 4 }}>
                            1RM = 116.7kg
                          </Text>
                        </View>
                      </View>

                      <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text.primary }}>
                          Example 2: Squat
                        </Text>
                        <View style={{ marginLeft: 16 }}>
                          <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>
                            Weight: 80kg × 10 reps
                          </Text>
                          <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>
                            1RM = 80 × (1 + 10/30)
                          </Text>
                          <Text style={{ color: colors.text.secondary, marginBottom: 4 }}>
                            1RM = 80 × 1.333
                          </Text>
                          <Text style={{ fontWeight: 'bold', color: colors.primary[600], marginTop: 4 }}>
                            1RM = 106.7kg
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.text.primary }}>
                      Why 1RM Matters
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
                          <Target size={14} color={colors.primary[600]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', color: colors.text.primary }}>Standardized Comparison</Text>
                          <Text style={{ fontSize: 14, color: colors.text.secondary }}>Allows you to compare strength across different rep ranges</Text>
                        </View>
                      </View>
                      
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
                          <Calculator size={14} color={colors.primary[600]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', color: colors.text.primary }}>Program Planning</Text>
                          <Text style={{ fontSize: 14, color: colors.text.secondary }}>Helps determine training loads as percentages of your max</Text>
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
                          <TrendingUp size={14} color={colors.primary[600]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', color: colors.text.primary }}>Progress Tracking</Text>
                          <Text style={{ fontSize: 14, color: colors.text.secondary }}>Tracks strength progression over time, regardless of rep scheme</Text>
                        </View>
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
