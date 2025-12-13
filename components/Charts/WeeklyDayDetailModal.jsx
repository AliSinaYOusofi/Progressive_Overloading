import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Calendar, Dumbbell, Repeat, Layers, Clock, TrendingUp } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { getExerciseSetsByDate } from "../../lib/database";
import { getCurrentUser } from "../../lib/database";

export default function WeeklyDayDetailModal({ visible, onClose, dayDate, userId }) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height
    const [sets, setSets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [groupedSets, setGroupedSets] = useState([]);

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

    // Fetch sets when modal opens
    useEffect(() => {
        const loadSets = async () => {
            if (!visible || !dayDate) return;
            
            setIsLoading(true);
            try {
                const currentUserId = userId || (await getCurrentUser())?.id;
                if (!currentUserId) {
                    setSets([]);
                    return;
                }

                const daySets = await getExerciseSetsByDate(currentUserId, dayDate);
                setSets(daySets);

                // Group sets by exercise
                const grouped = daySets.reduce((acc, set) => {
                    const exerciseName = set.exercises?.name || 'Unknown';
                    if (!acc[exerciseName]) {
                        acc[exerciseName] = [];
                    }
                    acc[exerciseName].push(set);
                    return acc;
                }, {});

                // Convert to array and sort by exercise name
                const groupedArray = Object.entries(grouped)
                    .map(([exerciseName, exerciseSets]) => ({
                        exerciseName,
                        sets: exerciseSets.sort((a, b) => 
                            new Date(a.performed_at) - new Date(b.performed_at)
                        ),
                        totalVolume: exerciseSets.reduce((sum, s) => 
                            sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0
                        ),
                    }))
                    .sort((a, b) => b.totalVolume - a.totalVolume);

                setGroupedSets(groupedArray);
            } catch (error) {
                console.error('Error loading sets:', error);
                setSets([]);
                setGroupedSets([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadSets();
    }, [visible, dayDate, userId]);

    if (!dayDate) {
        return null;
    }

    // Format date
    const formattedDate = dayDate.toLocaleDateString("en", { 
        weekday: "long",
        month: "long", 
        day: "numeric",
        year: "numeric"
    });

    // Format volume
    const formatVolume = (volume) => {
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}k`;
        }
        return volume.toFixed(0);
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en", { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: true 
        });
    };

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
                                            Workout Details
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
                                    </View>
                                ) : groupedSets.length > 0 ? (
                                    <View>
                                        {groupedSets.map((group, groupIndex) => (
                                            <View
                                                key={group.exerciseName}
                                                style={{
                                                    backgroundColor: colors.background.primary,
                                                    borderRadius: 12,
                                                    padding: 16,
                                                    marginBottom: 16,
                                                    borderWidth: 1,
                                                    borderColor: colors.border.light,
                                                }}
                                            >
                                                {/* Exercise Header */}
                                                <View style={{ 
                                                    flexDirection: "row", 
                                                    alignItems: "center", 
                                                    justifyContent: "space-between",
                                                    marginBottom: 16,
                                                    paddingBottom: 14,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: colors.border.light,
                                                }}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                                        <View style={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: 12,
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            backgroundColor: colors.background.primary,
                                                            marginRight: 12,
                                                            borderWidth: 1,
                                                            borderColor: colors.border.light,
                                                        }}>
                                                            <Dumbbell size={20} color={colors.text.tertiary} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ 
                                                                fontSize: 18, 
                                                                fontWeight: "800", 
                                                                color: colors.text.primary,
                                                                marginBottom: 2,
                                                            }}>
                                                                {group.exerciseName}
                                                            </Text>
                                                            <Text style={{ 
                                                                fontSize: 12, 
                                                                color: colors.text.tertiary,
                                                                fontWeight: "500",
                                                            }}>
                                                                {group.sets.length} {group.sets.length === 1 ? 'set' : 'sets'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ 
                                                        alignItems: "flex-end",
                                                        backgroundColor: colors.primary[50],
                                                        paddingHorizontal: 14,
                                                        paddingVertical: 10,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: colors.primary[200],
                                                    }}>
                                                        <Text style={{ 
                                                            fontSize: 18, 
                                                            fontWeight: "800", 
                                                            color: colors.primary[700],
                                                            lineHeight: 22,
                                                        }}>
                                                            {formatVolume(group.totalVolume)}
                                                        </Text>
                                                        <Text style={{ 
                                                            fontSize: 11, 
                                                            color: colors.text.tertiary,
                                                            fontWeight: "600",
                                                            marginTop: 2,
                                                        }}>
                                                            kg total
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Sets List */}
                                                <View style={{ gap: 10 }}>
                                                    {group.sets.map((set, setIndex) => {
                                                        const setVolume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
                                                        const isLastSet = setIndex === group.sets.length - 1;
                                                        
                                                        return (
                                                            <View
                                                                key={set.id || setIndex}
                                                                style={{
                                                                    backgroundColor: colors.background.card,
                                                                    borderRadius: 12,
                                                                    padding: 14,
                                                                    borderWidth: 1,
                                                                    borderColor: colors.border.light,
                                                                    marginBottom: isLastSet ? 0 : 0,
                                                                }}
                                                            >
                                                                {/* Set Header */}
                                                                <View style={{ 
                                                                    flexDirection: "row", 
                                                                    alignItems: "center", 
                                                                    justifyContent: "space-between",
                                                                    marginBottom: 12,
                                                                }}>
                                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                                        <View style={{
                                                                            width: 32,
                                                                            height: 32,
                                                                            borderRadius: 8,
                                                                            backgroundColor: colors.primary[100],
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                        }}>
                                                                            <Text style={{ 
                                                                                fontSize: 14, 
                                                                                fontWeight: "800", 
                                                                                color: colors.primary[700],
                                                                            }}>
                                                                                {setIndex + 1}
                                                                            </Text>
                                                                        </View>
                                                                        <Text style={{ 
                                                                            fontSize: 15, 
                                                                            fontWeight: "700", 
                                                                            color: colors.text.primary,
                                                                        }}>
                                                                            Set {setIndex + 1}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                                        <Clock size={12} color={colors.text.tertiary} />
                                                                        <Text style={{ 
                                                                            fontSize: 11, 
                                                                            color: colors.text.tertiary,
                                                                            fontWeight: "500",
                                                                        }}>
                                                                            {formatTime(set.performed_at)}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                {/* Set Stats */}
                                                                <View style={{ 
                                                                    flexDirection: "row", 
                                                                    flexWrap: "wrap", 
                                                                    gap: 8,
                                                                    marginBottom: 8,
                                                                }}>
                                                                    {/* Weight Badge */}
                                                                    <View style={{
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                        backgroundColor: colors.background.primary,
                                                                        paddingHorizontal: 12,
                                                                        paddingVertical: 8,
                                                                        borderRadius: 10,
                                                                        borderWidth: 1,
                                                                        borderColor: colors.border.light,
                                                                        flex: 1,
                                                                        minWidth: "30%",
                                                                    }}>
                                                                        <Dumbbell size={16} color={colors.text.tertiary} />
                                                                        <View style={{ marginLeft: 8, flex: 1 }}>
                                                                            <Text style={{ 
                                                                                fontSize: 16, 
                                                                                fontWeight: "800", 
                                                                                color: colors.text.primary,
                                                                                lineHeight: 20,
                                                                            }}>
                                                                                {set.weight?.toFixed(1) || '0'}
                                                                            </Text>
                                                                            <Text style={{ 
                                                                                fontSize: 10, 
                                                                                color: colors.text.tertiary,
                                                                                fontWeight: "500",
                                                                                marginTop: 1,
                                                                            }}>
                                                                                kg
                                                                            </Text>
                                                                        </View>
                                                                    </View>

                                                                    {/* Reps Badge */}
                                                                    <View style={{
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                        backgroundColor: colors.background.primary,
                                                                        paddingHorizontal: 12,
                                                                        paddingVertical: 8,
                                                                        borderRadius: 10,
                                                                        borderWidth: 1,
                                                                        borderColor: colors.border.light,
                                                                        flex: 1,
                                                                        minWidth: "30%",
                                                                    }}>
                                                                        <Repeat size={16} color={colors.text.tertiary} />
                                                                        <View style={{ marginLeft: 8, flex: 1 }}>
                                                                            <Text style={{ 
                                                                                fontSize: 16, 
                                                                                fontWeight: "800", 
                                                                                color: colors.text.primary,
                                                                                lineHeight: 20,
                                                                            }}>
                                                                                {set.reps || 0}
                                                                                {set.sets && set.sets > 1 && (
                                                                                    <Text style={{ fontSize: 12, fontWeight: "600" }}>
                                                                                        {' '}× {set.sets}
                                                                                    </Text>
                                                                                )}
                                                                            </Text>
                                                                            <Text style={{ 
                                                                                fontSize: 10, 
                                                                                color: colors.text.tertiary,
                                                                                fontWeight: "500",
                                                                                marginTop: 1,
                                                                            }}>
                                                                                reps
                                                                            </Text>
                                                                        </View>
                                                                    </View>

                                                                    {/* RPE Badge (if available) */}
                                                                    {set.rpe ? (
                                                                        <View style={{
                                                                            flexDirection: "row",
                                                                            alignItems: "center",
                                                                            backgroundColor: colors.background.primary,
                                                                            paddingHorizontal: 12,
                                                                            paddingVertical: 8,
                                                                            borderRadius: 10,
                                                                            borderWidth: 1,
                                                                            borderColor: colors.border.light,
                                                                            flex: 1,
                                                                            minWidth: "30%",
                                                                        }}>
                                                                            <TrendingUp size={16} color={colors.text.tertiary} />
                                                                            <View style={{ marginLeft: 8, flex: 1 }}>
                                                                                <Text style={{ 
                                                                                    fontSize: 16, 
                                                                                    fontWeight: "800", 
                                                                                    color: colors.text.primary,
                                                                                    lineHeight: 20,
                                                                                }}>
                                                                                    {set.rpe}
                                                                                </Text>
                                                                                <Text style={{ 
                                                                                    fontSize: 10, 
                                                                                    color: colors.text.tertiary,
                                                                                    fontWeight: "500",
                                                                                    marginTop: 1,
                                                                                }}>
                                                                                    RPE
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    ) : (
                                                                        <View style={{
                                                                            flexDirection: "row",
                                                                            alignItems: "center",
                                                                            backgroundColor: colors.background.primary,
                                                                            paddingHorizontal: 12,
                                                                            paddingVertical: 8,
                                                                            borderRadius: 10,
                                                                            borderWidth: 1,
                                                                            borderColor: colors.border.light,
                                                                            flex: 1,
                                                                            minWidth: "30%",
                                                                        }}>
                                                                            <Layers size={16} color={colors.text.tertiary} />
                                                                            <View style={{ marginLeft: 8, flex: 1 }}>
                                                                                <Text style={{ 
                                                                                    fontSize: 16, 
                                                                                    fontWeight: "800", 
                                                                                    color: colors.text.primary,
                                                                                    lineHeight: 20,
                                                                                }}>
                                                                                    {set.sets || 1}
                                                                                </Text>
                                                                                <Text style={{ 
                                                                                    fontSize: 10, 
                                                                                    color: colors.text.tertiary,
                                                                                    fontWeight: "500",
                                                                                    marginTop: 1,
                                                                                }}>
                                                                                    sets
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    )}
                                                                </View>

                                                                {/* Set Volume (if multiple sets or significant volume) */}
                                                                {setVolume > 0 && (
                                                                    <View style={{
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                        justifyContent: "space-between",
                                                                        paddingTop: 10,
                                                                        borderTopWidth: 1,
                                                                        borderTopColor: colors.border.light,
                                                                    }}>
                                                                        <Text style={{ 
                                                                            fontSize: 11, 
                                                                            color: colors.text.tertiary,
                                                                            fontWeight: "500",
                                                                        }}>
                                                                            Set Volume
                                                                        </Text>
                                                                        <Text style={{ 
                                                                            fontSize: 13, 
                                                                            fontWeight: "700", 
                                                                            color: colors.text.secondary,
                                                                        }}>
                                                                            {formatVolume(setVolume)} kg
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        );
                                                    })}
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
                                        <Text style={{ 
                                            fontSize: 16, 
                                            color: colors.text.secondary 
                                        }}>
                                            No sets logged on this day
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
