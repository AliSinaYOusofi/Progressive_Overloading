import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Calendar, Dumbbell, TrendingUp, Activity, Repeat, Layers } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { getExerciseSetsByDate } from "../../lib/database";
import { getCurrentUser } from "../../lib/database";
import { formatShortNumber } from "../../utils/numberUtils";
import { MODAL_LAYOUT } from "../../constants/modal";

export default function VolumeDayDetailModal({ visible, onClose, volumeEntry }) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height
    const [isLoading, setIsLoading] = useState(false);
    const [exerciseStats, setExerciseStats] = useState({}); // Map of exercise name to { totalSets, totalReps }

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

    // Fetch sets data when modal opens
    useEffect(() => {
        const loadSets = async () => {
            if (!visible || !volumeEntry || !volumeEntry.date) return;
            
            setIsLoading(true);
            try {
                const currentUserId = (await getCurrentUser())?.id;
                if (!currentUserId) {
                    setExerciseStats({});
                    return;
                }

                const dayDate = new Date(volumeEntry.date);
                const daySets = await getExerciseSetsByDate(currentUserId, dayDate);

                // Group sets by exercise and calculate totals
                const stats = daySets.reduce((acc, set) => {
                    const exerciseName = set.exercises?.name || 'Unknown';
                    if (!acc[exerciseName]) {
                        acc[exerciseName] = {
                            totalSets: 0,
                            totalReps: 0,
                        };
                    }
                    
                    // Each row represents one set, but may have a 'sets' field indicating multiple sets
                    const setsCount = set.sets || 1;
                    const reps = set.reps || 0;
                    
                    acc[exerciseName].totalSets += setsCount;
                    acc[exerciseName].totalReps += reps * setsCount;
                    
                    return acc;
                }, {});

                setExerciseStats(stats);
            } catch (error) {
                console.error('Error loading sets:', error);
                setExerciseStats({});
            } finally {
                setIsLoading(false);
            }
        };

        loadSets();
    }, [visible, volumeEntry]);

    if (!volumeEntry) {
        return null;
    }

    // Format date
    const formattedDate = new Date(volumeEntry.date).toLocaleDateString("en", { 
        month: "short", 
        day: "numeric",
        year: "numeric"
    });


    // Get exercise volumes sorted by volume (descending)
    const exerciseVolumes = volumeEntry.exerciseVolumes || {};
    const totalVolume = volumeEntry.totalVolume || 0;
    const sortedExercises = Object.entries(exerciseVolumes)
        .map(([name, volume]) => ({ 
            name, 
            volume,
            percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0
        }))
        .sort((a, b) => b.volume - a.volume);
    const exerciseCount = volumeEntry.exerciseCount || sortedExercises.length;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
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
                                {isLoading ? (
                                    <View style={{ 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        paddingVertical: 60 
                                    }}>
                                        <ActivityIndicator size="large" color={colors.primary[600]} />
                                        <Text style={{ 
                                            fontSize: 14, 
                                            color: colors.text.secondary,
                                            marginTop: 16,
                                        }}>
                                            Loading exercise details...
                                        </Text>
                                    </View>
                                ) : sortedExercises.length > 0 ? (
                                    <View>
                                        {/* Summary Card */}
                                        <View style={{
                                            backgroundColor: colors.background.input || colors.neutral[50],
                                            borderRadius: 16,
                                            padding: 20,
                                            marginBottom: 24,
                                            borderWidth: 1,
                                            borderColor: colors.border.light,
                                        }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                                                <View style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 12,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: colors.background.secondary || colors.neutral[100],
                                                    marginRight: 12,
                                                }}>
                                                    <TrendingUp size={22} color={colors.icon.primary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ 
                                                        fontSize: 13, 
                                                        fontWeight: "600", 
                                                        color: colors.text.secondary,
                                                        textTransform: "uppercase",
                                                        letterSpacing: 0.5,
                                                    }}>
                                                        Total Volume
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 28, 
                                                        fontWeight: "700", 
                                                        color: colors.text.primary,
                                                        marginTop: 4,
                                                    }}>
                                                        {formatShortNumber(totalVolume)} <Text style={{ fontSize: 18, color: colors.text.secondary }}>kg</Text>
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ 
                                                flexDirection: "row", 
                                                alignItems: "center",
                                                paddingTop: 16,
                                                borderTopWidth: 1,
                                                borderTopColor: colors.border.light,
                                            }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 24 }}>
                                                    <Activity size={16} color={colors.icon.primary} />
                                                    <Text style={{ 
                                                        fontSize: 14, 
                                                        fontWeight: "600", 
                                                        color: colors.text.secondary,
                                                        marginLeft: 8,
                                                    }}>
                                                        {exerciseCount} {exerciseCount === 1 ? 'Exercise' : 'Exercises'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Exercise List Header */}
                                        <View style={{ marginBottom: 12 }}>
                                            <View style={{ 
                                                flexDirection: "row", 
                                                alignItems: "center", 
                                                justifyContent: "space-between",
                                                marginBottom: 6,
                                                paddingHorizontal: 4,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: "700", 
                                                    color: colors.text.primary 
                                                }}>
                                                    Exercise Breakdown
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 13, 
                                                    fontWeight: "500", 
                                                    color: colors.text.secondary 
                                                }}>
                                                    Sorted by volume
                                                </Text>
                                            </View>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                paddingHorizontal: 4,
                                                fontStyle: "italic",
                                            }}>
                                                Progress bars show each exercise's contribution to total volume
                                            </Text>
                                        </View>

                                        {/* Exercise Items */}
                                        {sortedExercises.map((exercise, index) => (
                                            <View
                                                key={exercise.name}
                                                style={{
                                                    backgroundColor: colors.background.card,
                                                    borderRadius: 14,
                                                    padding: 16,
                                                    marginBottom: 10,
                                                    borderWidth: 1,
                                                    borderColor: colors.border.light,
                                                    shadowColor: "#000",
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: 0.05,
                                                    shadowRadius: 2,
                                                    elevation: 1,
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                                                    {/* Rank Badge */}
                                                    <View style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 8,
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: colors.background.secondary || colors.neutral[100],
                                                        marginRight: 12,
                                                    }}>
                                                        <Text style={{ 
                                                            fontSize: 14, 
                                                            fontWeight: "700", 
                                                            color: colors.text.secondary 
                                                        }}>
                                                            #{index + 1}
                                                        </Text>
                                                    </View>
                                                    
                                                    {/* Exercise Name */}
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ 
                                                            fontSize: 16, 
                                                            fontWeight: "600", 
                                                            color: colors.text.primary,
                                                            marginBottom: 2,
                                                        }}>
                                                            {exercise.name}
                                                        </Text>
                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                                                            {/* Sets */}
                                                            {exerciseStats[exercise.name]?.totalSets > 0 && (
                                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                                                    <Layers size={12} color={colors.text.secondary} />
                                                                    <Text style={{ 
                                                                        fontSize: 12, 
                                                                        color: colors.text.secondary,
                                                                        fontWeight: "500",
                                                                    }}>
                                                                        {exerciseStats[exercise.name].totalSets} {exerciseStats[exercise.name].totalSets === 1 ? 'set' : 'sets'}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                            {/* Reps */}
                                                            {exerciseStats[exercise.name]?.totalReps > 0 && (
                                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                                                    <Repeat size={12} color={colors.text.secondary} />
                                                                    <Text style={{ 
                                                                        fontSize: 12, 
                                                                        color: colors.text.secondary,
                                                                        fontWeight: "500",
                                                                    }}>
                                                                        {exerciseStats[exercise.name].totalReps} {exerciseStats[exercise.name].totalReps === 1 ? 'rep' : 'reps'}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        {/* Volume and Percentage - Redesigned */}
                                                        <View style={{ 
                                                            flexDirection: "row", 
                                                            alignItems: "center", 
                                                            gap: 8, 
                                                            marginTop: 6,
                                                            paddingTop: 6,
                                                            borderTopWidth: 1,
                                                            borderTopColor: colors.border.light,
                                                        }}>
                                                            <Text style={{ 
                                                                fontSize: 13, 
                                                                color: colors.text.secondary,
                                                                fontWeight: "600",
                                                            }}>
                                                                {formatShortNumber(exercise.volume)} kg
                                                            </Text>
                                                            <Text style={{ 
                                                                fontSize: 12, 
                                                                color: colors.text.tertiary,
                                                            }}>
                                                                •
                                                            </Text>
                                                            <Text style={{ 
                                                                fontSize: 12, 
                                                                color: colors.text.tertiary,
                                                                fontWeight: "500",
                                                            }}>
                                                                {exercise.percentage.toFixed(1)}% of total
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    
                                                    {/* Volume */}
                                                    <View style={{ alignItems: "flex-end" }}>
                                                        <Text style={{ 
                                                            fontSize: 20, 
                                                            fontWeight: "700", 
                                                            color: colors.text.primary 
                                                        }}>
                                                            {formatShortNumber(exercise.volume)}
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
                                                
                                                {/* Progress Bar */}
                                                <View style={{
                                                    height: 6,
                                                    backgroundColor: colors.background.secondary || colors.border.light,
                                                    borderRadius: 3,
                                                    overflow: "hidden",
                                                    marginTop: 8,
                                                }}>
                                                    <View style={{
                                                        height: "100%",
                                                        width: `${exercise.percentage}%`,
                                                        backgroundColor: colors.icon.primary,
                                                        borderRadius: 3,
                                                    }} />
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={{ 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        paddingVertical: 60 
                                    }}>
                                        <View style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 32,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: colors.background.secondary || colors.neutral[50],
                                            marginBottom: 16,
                                        }}>
                                            <Dumbbell size={32} color={colors.text.tertiary} />
                                        </View>
                                        <Text style={{ 
                                            fontSize: 18, 
                                            fontWeight: "600",
                                            color: colors.text.primary,
                                            marginBottom: 8,
                                        }}>
                                            No exercise data available
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 14, 
                                            color: colors.text.secondary 
                                        }}>
                                            No workouts recorded for this day
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
