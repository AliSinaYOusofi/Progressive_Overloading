import React, { useEffect, useCallback } from "react"
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from '../../hooks/useThemedColors'
import { useTheme } from '../../contexts/ThemeContext'
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { MODAL_LAYOUT } from "../../constants/modal"

const { height: screenHeight } = Dimensions.get('window')

export default function ProgressiveOverloadInfoModal({ visible, onClose }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <GestureDetector gesture={panGesture}>
            <Animated.View 
              style={[
                { 
                  backgroundColor: colors.background.card,
                  borderRadius: MODAL_LAYOUT.borderRadius,
                  overflow: 'hidden',
                  height: screenHeight * 0.85,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 20
                },
                animatedStyle
              ]}
            >
              {/* Drag Handle */}
              <Animated.View style={[
                { 
                  width: 48, 
                  height: 4, 
                  borderRadius: 2, 
                  alignSelf: "center", 
                  marginTop: 12, 
                  marginBottom: 8 
                },
                dragHandleAnimatedStyle
              ]} />

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12
                  }}
                >
                  <Ionicons name="analytics" size={24} color={colors.icon?.primary || colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                  Progressive Overload
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.background.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ fontSize: 20, color: colors.text.tertiary, fontWeight: "500" }}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          >
            {/* What is Progressive Overload */}
            <View 
              style={{ 
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border.light
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <Ionicons name="trending-up" size={18} color={colors.icon?.primary || colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary }}>
                  What is Progressive Overload?
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 12 }}>
                Progressive overload is the <Text style={{ fontWeight: "700", color: colors.text.primary }}>gradual increase of stress</Text> placed on your body during exercise. It's the key principle for building strength and muscle!
              </Text>
              <View 
                style={{ 
                  backgroundColor: colors.background.primary, 
                  padding: 14, 
                  borderRadius: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary[600]
                }}
              >
                <Text style={{ fontSize: 13, color: colors.text.secondary, fontWeight: "500" }}>
                  💡 To progress, you must gradually increase weight, reps, sets, or frequency over time.
                </Text>
              </View>
            </View>

            {/* How We Calculate It */}
            <View 
              style={{ 
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border.light
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <Ionicons name="calculator" size={18} color={colors.icon?.primary || colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary }}>
                  How We Track Progress
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 12 }}>
                We use <Text style={{ fontWeight: "700", color: colors.text.primary }}>Estimated 1RM (One Rep Max)</Text> to track your strength progression. This normalizes different rep ranges so we can accurately compare your progress over time.
              </Text>
              <View 
                style={{ 
                  backgroundColor: colors.background.primary, 
                  padding: 14, 
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 15, color: colors.text.primary, fontWeight: "700", marginBottom: 8 }}>
                  Calculation Method:
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                  • We calculate your estimated 1RM for each set{'\n'}
                  • Compare <Text style={{ fontWeight: "700", color: colors.text.primary }}>first half</Text> vs <Text style={{ fontWeight: "700", color: colors.text.primary }}>second half</Text> of timeframe{'\n'}
                  • Calculate the percentage change{'\n'}
                  • Normalize to weekly rate based on actual time span
                </Text>
              </View>
            </View>

            {/* Metrics Explained */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Ionicons name="stats-chart" size={18} color={colors.icon?.primary || colors.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text.primary }}>
                  Understanding Your Stats
                </Text>
              </View>
              
              {/* Total Gain */}
              <View 
                style={{ 
                  backgroundColor: colors.background.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="trophy" size={18} color={colors.icon?.primary || colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Total Gain
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      The <Text style={{ fontWeight: "700", color: colors.text.primary }}>overall percentage</Text> your strength has improved during the selected timeframe. This is your total achievement!
                    </Text>
                  </View>
                </View>
              </View>

              {/* Weekly Rate */}
              <View 
                style={{ 
                  backgroundColor: colors.background.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="calendar" size={18} color={colors.icon?.primary || colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Per Week Rate
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Your <Text style={{ fontWeight: "700", color: colors.text.primary }}>average gain per week</Text>. This normalizes progress across different timeframes, making it easy to compare.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Time Span */}
              <View 
                style={{ 
                  backgroundColor: colors.background.card,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="time" size={18} color={colors.icon?.primary || colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Time Span
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      The <Text style={{ fontWeight: "700", color: colors.text.primary }}>actual number of weeks</Text> between your first and last workout for this exercise in the selected timeframe.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Progression Categories */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Ionicons name="ribbon" size={18} color={colors.icon?.primary || colors.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text.primary }}>
                  Progression Levels
                </Text>
              </View>
              
              {/* Excellent */}
              <View 
                style={{ 
                  backgroundColor: colors.status.success + "15",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.status.success + "25"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.status.success,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="trending-up" size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Excellent
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Gaining <Text style={{ fontWeight: "700", color: colors.text.primary }}>more than 2% per week</Text> — Outstanding progress! You're crushing it! 🔥
                    </Text>
                  </View>
                </View>
              </View>

              {/* Good */}
              <View 
                style={{ 
                  backgroundColor: colors.primary[600] + "15",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.primary[600] + "25"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.primary[600],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="arrow-up" size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Good
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Gaining <Text style={{ fontWeight: "700", color: colors.text.primary }}>0.5-2% per week</Text> — Solid, sustainable progress. Keep up the great work! 💪
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stable */}
              <View 
                style={{ 
                  backgroundColor: colors.status.warning + "15",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.status.warning + "25"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.status.warning,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="arrow-forward" size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Stable
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Change within <Text style={{ fontWeight: "700", color: colors.text.primary }}>±0.5% per week</Text> — Maintaining strength. Consider increasing intensity or volume.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Declining */}
              <View 
                style={{ 
                  backgroundColor: colors.status.error + "15",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.status.error + "25"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.status.error,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="trending-down" size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Declining
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Losing <Text style={{ fontWeight: "700", color: colors.text.primary }}>more than 0.5% per week</Text> — Check recovery, nutrition, and form. May need deload week.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tips */}
            <View 
              style={{ 
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border.light
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <Ionicons name="bulb" size={18} color={colors.icon?.primary || colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary }}>
                  Pro Tips
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 22 }}>
                • Aim for <Text style={{ fontWeight: "700", color: colors.text.primary }}>1-2% weekly gains</Text> for sustainable progress{'\n'}
                • Click any exercise name to see <Text style={{ fontWeight: "700", color: colors.text.primary }}>detailed charts</Text>{'\n'}
                • Use different timeframes to see short vs long-term trends{'\n'}
                • Follow the recommendations for optimal results! 🎯
              </Text>
            </View>
          </ScrollView>

          {/* Footer Button */}
          <View style={{ 
            paddingHorizontal: 24, 
            paddingTop: 12, 
            paddingBottom: 20, 
            borderTopWidth: 1, 
            borderTopColor: colors.border.light, 
            backgroundColor: colors.background.card 
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                paddingVertical: 14,
                borderRadius: 12,
                shadowColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text style={{ 
                textAlign: "center", 
                color: colors.text.white, 
                fontWeight: "700",
                fontSize: 16
              }}>
                Let's grow! 🚀
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

