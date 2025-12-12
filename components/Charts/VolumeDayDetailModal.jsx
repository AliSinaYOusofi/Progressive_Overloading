import React, { useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Calendar, Dumbbell } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function VolumeDayDetailModal({ visible, onClose, volumeEntry }) {
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

    if (!volumeEntry) {
        return null;
    }

    // Format date
    const formattedDate = new Date(volumeEntry.date).toLocaleDateString("en", { 
        month: "short", 
        day: "numeric",
        year: "numeric"
    });

    // Format volume with appropriate unit
    const formatVolume = (volume) => {
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}k`;
        }
        return volume.toFixed(0);
    };

    // Get exercise volumes sorted by volume (descending)
    const exerciseVolumes = volumeEntry.exerciseVolumes || {};
    const sortedExercises = Object.entries(exerciseVolumes)
        .map(([name, volume]) => ({ name, volume }))
        .sort((a, b) => b.volume - a.volume);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
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
                                maxHeight: "90%",
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

                            {/* Header */}
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
                                    <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: colors.primary[100]
                                    }}>
                                        <Calendar size={20} color={colors.primary[600]} />
                                    </View>
                                    <View>
                                        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                                            Exercise Breakdown
                                        </Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
                                            {formattedDate}
                                        </Text>
                                    </View>
                                </View>
                                <ModalCloseButton onPress={onClose} />
                            </View>

                            {/* Content */}
                            <ScrollView 
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                            >
                                {sortedExercises.length > 0 ? (
                                    <View>
                                        {sortedExercises.map((exercise, index) => (
                                            <View
                                                key={exercise.name}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    paddingVertical: 16,
                                                    paddingHorizontal: 16,
                                                    backgroundColor: colors.background.primary,
                                                    borderRadius: 12,
                                                    marginBottom: 12,
                                                    borderWidth: 1,
                                                    borderColor: colors.border.light,
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                                    <View style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 8,
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: colors.primary[50],
                                                        marginRight: 12,
                                                    }}>
                                                        <Dumbbell size={18} color={colors.primary[600]} />
                                                    </View>
                                                    <Text style={{ 
                                                        fontSize: 16, 
                                                        fontWeight: "600", 
                                                        color: colors.text.primary,
                                                        flex: 1,
                                                    }}>
                                                        {exercise.name}
                                                    </Text>
                                                </View>
                                                <View style={{ alignItems: "flex-end" }}>
                                                    <Text style={{ 
                                                        fontSize: 18, 
                                                        fontWeight: "700", 
                                                        color: colors.text.primary 
                                                    }}>
                                                        {formatVolume(exercise.volume)}
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                        marginTop: 2,
                                                    }}>
                                                        kg
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={{ 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        paddingVertical: 40 
                                    }}>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            color: colors.text.secondary 
                                        }}>
                                            No exercise data available
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}
