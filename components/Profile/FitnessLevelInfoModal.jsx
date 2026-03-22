import React, { useEffect, useCallback } from "react"
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { Award } from "lucide-react-native"
import { useThemedColors } from '../../hooks/useThemedColors'
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { MODAL_LAYOUT } from "../../constants/modal"

const FITNESS_LEVELS = [
  { label: "Beginner", range: "0 workouts", color: null, description: "Just getting started on your fitness journey." },
  { label: "Novice", range: "1 - 24 workouts", color: null, description: "Building the habit and learning proper form." },
  { label: "Intermediate", range: "25 - 74 workouts", color: null, description: "Consistent training with noticeable progress." },
  { label: "Advanced", range: "75 - 199 workouts", color: null, description: "Serious dedication with significant strength gains." },
  { label: "Expert", range: "200+ workouts", color: null, description: "Elite commitment and peak performance." },
]

export default function FitnessLevelInfoModal({ visible, onClose, currentLevel, workoutCount }) {
  const colors = useThemedColors();
  const screenHeight = Dimensions.get("window").height;
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = screenHeight * 0.2;

  const levelColors = {
    Beginner: colors.text.tertiary,
    Novice: colors.status.info,
    Intermediate: colors.primary[600],
    Advanced: colors.status.warning,
    Expert: colors.status.success,
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SWIPE_THRESHOLD) {
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
          'worklet';
          scheduleOnRN(handleClose);
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const dragHandleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateY.value,
      [0, 50, 100],
      [colors.border.light, colors.primary[400], colors.primary[600]]
    );
    return { backgroundColor };
  });

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                {
                  backgroundColor: colors.background.card,
                  borderRadius: MODAL_LAYOUT.borderRadius,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 8,
                  maxHeight: screenHeight * 0.8,
                  overflow: "hidden",
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
                  alignSelf: 'center',
                  marginTop: 12,
                  marginBottom: 16
                },
                dragHandleAnimatedStyle
              ]} />

              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      backgroundColor: colors.primary[50]
                    }}
                  >
                    <Award size={20} color={colors.primary[600]} />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>
                    Fitness Levels
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.background.primary
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '500', color: colors.text.tertiary }}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Current Status */}
                <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                  <View style={{
                    backgroundColor: (levelColors[currentLevel] || colors.text.tertiary) + "10",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: (levelColors[currentLevel] || colors.text.tertiary) + "25",
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: (levelColors[currentLevel] || colors.text.tertiary) + "18",
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Award size={22} color={levelColors[currentLevel] || colors.text.tertiary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.tertiary, marginBottom: 2 }}>
                        Your Current Level
                      </Text>
                      <Text style={{ fontSize: 20, fontWeight: "800", color: levelColors[currentLevel] || colors.text.tertiary }}>
                        {currentLevel}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary }}>
                        {workoutCount}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.text.tertiary, fontWeight: "500" }}>
                        workouts
                      </Text>
                    </View>
                  </View>
                </View>

                {/* All Levels */}
                <View style={{ paddingHorizontal: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12, color: colors.text.primary }}>
                    All Levels
                  </Text>
                  <View style={{
                    borderRadius: 16,
                    backgroundColor: colors.background.primary,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    overflow: 'hidden',
                  }}>
                    {FITNESS_LEVELS.map((level, index) => {
                      const color = levelColors[level.label];
                      const isCurrent = level.label === currentLevel;
                      return (
                        <View
                          key={level.label}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 14,
                            backgroundColor: isCurrent ? color + "08" : "transparent",
                            borderBottomWidth: index < FITNESS_LEVELS.length - 1 ? 1 : 0,
                            borderBottomColor: colors.border.light,
                          }}
                        >
                          <View style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: color,
                            marginRight: 12,
                          }} />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <Text style={{
                                fontSize: 15,
                                fontWeight: isCurrent ? "700" : "500",
                                color: isCurrent ? color : colors.text.primary,
                              }}>
                                {level.label}
                              </Text>
                              {isCurrent && (
                                <View style={{
                                  backgroundColor: color + "20",
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 6,
                                }}>
                                  <Text style={{ fontSize: 10, fontWeight: "700", color }}>
                                    YOU
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                              {level.description}
                            </Text>
                          </View>
                          <Text style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: isCurrent ? color : colors.text.secondary,
                          }}>
                            {level.range}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </Animated.View>
          </GestureDetector>
        </TouchableOpacity>
      </GestureHandlerRootView>
    </Modal>
  )
}
