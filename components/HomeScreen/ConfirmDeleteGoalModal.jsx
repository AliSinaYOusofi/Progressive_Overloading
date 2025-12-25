import React, { useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { Trash2, AlertTriangle } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function ConfirmDeleteGoalModal({
  visible,
  onClose,
  onConfirm,
  goalTitle,
  isDeleting = false,
}) {
  const colors = useThemedColors();
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
      [colors.border.light, colors.status.error + '40', colors.status.error]
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
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[
              { 
                backgroundColor: colors.background.card, 
                borderTopLeftRadius: 24, 
                borderTopRightRadius: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 20
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
              
              <View style={{ padding: 24 }}>
                {/* Header */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <View style={{ 
                      backgroundColor: colors.status.errorLight || colors.background.input, 
                      padding: 12, 
                      borderRadius: 20, 
                      marginRight: 12 
                    }}>
                      <AlertTriangle size={20} color={colors.status.error} />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text.primary, flex: 1 }}>
                      Delete Goal
                    </Text>
                  </View>
                  <ModalCloseButton onPress={onClose} size={18} disabled={isDeleting} />
                </View>

                {/* Warning Message */}
                <View style={{ 
                  backgroundColor: colors.status.card, 
                  padding: 16, 
                  borderRadius: 12, 
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: colors.status.error + '30' || colors.border.light
                }}>
                  <Text style={{ color: colors.text.primary, fontSize: 16, lineHeight: 22, marginBottom: 8 }}>
                    Are you sure you want to delete this goal?
                  </Text>
                  {goalTitle && (
                    <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>
                      "{goalTitle}"
                    </Text>
                  )}
                  <Text style={{ color: colors.status.error, fontSize: 14, lineHeight: 20, marginTop: 8, fontWeight: '500' }}>
                    This action cannot be undone.
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={onClose}
                    disabled={isDeleting}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 16,
                      backgroundColor: colors.background.input,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border.light,
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    <Text style={{ color: colors.text.primary, fontWeight: "600", fontSize: 16 }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onConfirm}
                    disabled={isDeleting}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 16,
                      backgroundColor: colors.status.error,
                      borderRadius: 12,
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={colors.text.white} />
                    ) : (
                      <>
                        <Trash2 size={18} color={colors.text.white} />
                        <Text style={{ marginLeft: 8, color: colors.text.white, fontWeight: "600", fontSize: 16 }}>
                          Delete
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </GestureDetector>
        </TouchableOpacity>
      </GestureHandlerRootView>
    </Modal>
  );
}

