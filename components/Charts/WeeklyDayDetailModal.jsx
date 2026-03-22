import React, { useEffect, useCallback, useState, useMemo } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Calendar, Dumbbell, Repeat, Layers, Clock, TrendingUp } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import ModalCloseButton from "../ModalCloseButton";
import LoadMoreButton from "../HomeScreen/LoadMoreButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { formatShortNumber } from "../../utils/numberUtils";
import { MODAL_LAYOUT } from "../../constants/modal";

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function WeeklyDayDetailModal({ visible, onClose, dayDate, userId }) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height
    const [isLoading, setIsLoading] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_COUNT);
    
    // Use Zustand store for day detail data
    const user = useAppStore(state => state.user);
    const loadDayDetailData = useAppStore(state => state.loadDayDetailData);
    
    // Get cached data for this date
    const dayDetailData = useAppStore(state => {
      if (!dayDate) return null;
      const dateKey = state.getDateKey(dayDate);
      return state.dayDetailData[dateKey] || null;
    });
    
    // Extract sets and groupedSets from cached data
    const sets = useMemo(() => dayDetailData?.sets || [], [dayDetailData]);
    const groupedSets = useMemo(() => dayDetailData?.groupedSets || [], [dayDetailData]);

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
            [colors.border.light, colors.text.tertiary, colors.text.secondary]
        );
        return {
            backgroundColor,
        };
    });

    // Reset translateY and display limit when modal becomes visible
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
            setDisplayLimit(INITIAL_DISPLAY_COUNT);
        }
    }, [visible, translateY]);


    // Load day detail data when modal opens (only if not cached)
    useEffect(() => {
        const loadData = async () => {
            if (!visible || !dayDate || !user) return;
            
            // Only show loading if data is not cached
            if (!dayDetailData) {
                setIsLoading(true);
            }
            
            try {
                await loadDayDetailData(dayDate);
            } catch (error) {
                console.error('Error loading day detail data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [visible, dayDate, user, loadDayDetailData, dayDetailData]);

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
                                overflow: 'hidden',
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
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 12 }}>
                                    <View style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: colors.background.card,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}>
                                        <Calendar size={20} color={colors.text.tertiary} />
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }} numberOfLines={1}>
                                            Workout Details
                                        </Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }} numberOfLines={1}>
                                            {formattedDate}
                                        </Text>
                                        {groupedSets.length > 0 && (
                                            <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }} numberOfLines={1}>
                                                {groupedSets.length} {groupedSets.length === 1 ? 'exercise' : 'exercises'} • {groupedSets.reduce((sum, g) => sum + g.totalSets, 0)} {groupedSets.reduce((sum, g) => sum + g.totalSets, 0) === 1 ? 'set' : 'sets'}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <View style={{ marginLeft: 8 }}>
                                    <ModalCloseButton onPress={onClose} />
                                </View>
                            </View>

                            {/* Content */}
                            <ScrollView 
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                                style={{ backgroundColor: colors.background.card }}
                            >
                                {isLoading ? (
                                    <View style={{ 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        paddingVertical: 60 
                                    }}>
                                        <ActivityIndicator size="large" color={colors.text.tertiary} />
                                    </View>
                                ) : groupedSets.length > 0 ? (
                                    <View>
                                        {groupedSets.slice(0, displayLimit).map((group, groupIndex) => (
                                            <View
                                                key={group.exerciseName}
                                                style={{
                                                    backgroundColor: colors.background.card,
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
                                                            backgroundColor: colors.background.card,
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
                                                                {group.totalSets} {group.totalSets === 1 ? 'set' : 'sets'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                    <View style={{ 
                                        alignItems: "flex-end",
                                        backgroundColor: colors.background.card,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}>
                                        <Text style={{ 
                                            fontSize: 18, 
                                            fontWeight: "800", 
                                            color: colors.text.primary,
                                            lineHeight: 22,
                                        }}>
                                            {formatShortNumber(group.totalVolume)}
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

                                                {/* Distinct Sets List */}
                                                <View style={{ gap: 8, marginTop: 8 }}>
                                                    {group.sets.map((set, setIndex) => {
                                                        const setVolume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
                                                        
                                                        return (
                                                            <View
                                                                key={set.id || `${group.exerciseName}_${setIndex}`}
                                                                style={{
                                                                    backgroundColor: colors.background.card,
                                                                    borderRadius: 8,
                                                                    padding: 12,
                                                                    borderWidth: 1,
                                                                    borderColor: colors.border.light,
                                                                }}
                                                            >
                                                                <View style={{ 
                                                                    flexDirection: "row", 
                                                                    alignItems: "center", 
                                                                    justifyContent: "space-between",
                                                                    marginBottom: 8,
                                                                }}>
                                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                                            <Layers size={14} color={colors.text.tertiary} />
                                                                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                                                                {set.sets || 1}
                                                                            </Text>
                                                                        </View>
                                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                                            <Repeat size={14} color={colors.text.tertiary} />
                                                                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                                                                {set.reps || 0}
                                                                            </Text>
                                                                        </View>
                                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                                            <Dumbbell size={14} color={colors.text.tertiary} />
                                                                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                                                                {set.weight || 0} kg
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={{ alignItems: "flex-end" }}>
                                                                        <Text style={{ 
                                                                            fontSize: 14, 
                                                                            fontWeight: "700", 
                                                                            color: colors.text.primary,
                                                                        }}>
                                                                            {formatShortNumber(setVolume)} kg
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                                    <Clock size={12} color={colors.text.tertiary} />
                                                                    <Text style={{ 
                                                                        fontSize: 10, 
                                                                        color: colors.text.tertiary,
                                                                        fontWeight: "500",
                                                                    }}>
                                                                        {formatTime(set.performed_at)}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        ))}
                                        {groupedSets.length > displayLimit && (
                                            <LoadMoreButton
                                                remaining={groupedSets.length - displayLimit}
                                                onLoadMore={() => setDisplayLimit(prev => Math.min(prev + LOAD_MORE_COUNT, groupedSets.length))}
                                                fullWidth={true}
                                            />
                                        )}
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
