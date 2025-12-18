import React, { useEffect, useCallback, useMemo, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Calendar, CheckCircle2, XCircle, TrendingUp, Activity, ChevronRight } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { BarChart } from "react-native-gifted-charts";
import WeeklyDayDetailModal from "./WeeklyDayDetailModal";
import { formatShortNumber } from "../../utils/numberUtils";

export default function WeeklyProgressModal({ visible, onClose, weeklyProgress, userId }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height
    const [showDayDetailModal, setShowDayDetailModal] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState(null);

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

    // Calculate week dates and enhance data
    const weekData = useMemo(() => {
        if (!weeklyProgress || weeklyProgress.length === 0) return [];
        
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return weeklyProgress.map((day, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index);
            
            return {
                ...day,
                date: dayDate,
                formattedDate: dayDate.toLocaleDateString("en", { 
                    month: "short", 
                    day: "numeric"
                }),
                fullDate: dayDate.toLocaleDateString("en", { 
                    month: "short", 
                    day: "numeric",
                    year: "numeric"
                }),
            };
        });
    }, [weeklyProgress]);

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        if (!weeklyProgress || weeklyProgress.length === 0) {
            return {
                totalVolume: 0,
                completedDays: 0,
                missedDays: 0,
                averageVolume: 0,
                bestDay: null,
                consistency: 0,
            };
        }

        const completedDays = weeklyProgress.filter(d => d.completed).length;
        const totalVolume = weeklyProgress.reduce((sum, d) => sum + (d.weight || 0), 0);
        const workoutDays = weeklyProgress.filter(d => d.completed && d.weight > 0);
        const averageVolume = workoutDays.length > 0 ? totalVolume / workoutDays.length : 0;
        
        const bestDay = weeklyProgress.reduce((best, current) => {
            if (current.weight > (best?.weight || 0)) {
                return current;
            }
            return best;
        }, null);

        const consistency = (completedDays / weeklyProgress.length) * 100;

        return {
            totalVolume,
            completedDays,
            missedDays: weeklyProgress.length - completedDays,
            averageVolume,
            bestDay,
            consistency,
        };
    }, [weeklyProgress]);


    // Handle day press
    const handleDayPress = (day) => {
        if (day.completed && day.date) {
            setSelectedDayDate(day.date);
            setShowDayDetailModal(true);
        }
    };

    // Prepare bar chart data
    const barChartData = useMemo(() => {
        if (!weekData || weekData.length === 0) return [];
        
        const maxVolume = Math.max(...weekData.map(d => d.weight || 0), 1);
        
        return weekData.map((day, index) => ({
            value: day.weight || 0,
            label: day.day.substring(0, 3),
            labelTextStyle: { 
                color: colors.text.tertiary, 
                fontSize: 10,
                fontWeight: '500',
            },
            frontColor: day.completed ? colors.primary[600] : colors.border.light,
            topLabelComponent: () => (
                <Text style={{ 
                    fontSize: 9, 
                    color: isDarkMode ? colors.text.white : colors.text.primary, 
                    fontWeight: '600',
                    marginBottom: 2 
                }}>
                    {formatShortNumber(day.weight)}
                </Text>
            ),
        }));
    }, [weekData, colors, isDarkMode]);

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
                                            Weekly Progress
                                        </Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
                                            Sets logged this week
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
                                {!weeklyProgress || weeklyProgress.length === 0 ? (
                                    <View style={{ 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        paddingVertical: 60 
                                    }}>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            color: colors.text.secondary 
                                        }}>
                                            No weekly progress data available
                                        </Text>
                                    </View>
                                ) : (
                                    <View>
                                        {/* Summary Statistics */}
                                        <View style={{ 
                                            flexDirection: "row", 
                                            flexWrap: "wrap", 
                                            gap: 12,
                                            marginBottom: 24 
                                        }}>
                                            <View style={{ 
                                                flex: 1,
                                                minWidth: "47%",
                                                backgroundColor: colors.primary[50],
                                                borderRadius: 12,
                                                padding: 16,
                                                borderWidth: 1,
                                                borderColor: colors.primary[200],
                                            }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                    <Activity size={18} color={colors.primary[600]} />
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                        fontWeight: "500",
                                                        textTransform: "uppercase",
                                                        letterSpacing: 0.5,
                                                    }}>
                                                        Total Volume
                                                    </Text>
                                                </View>
                                                <Text style={{ 
                                                    fontSize: 24, 
                                                    fontWeight: "800", 
                                                    color: colors.primary[700],
                                                    letterSpacing: -0.5,
                                                }}>
                                                    {formatShortNumber(summaryStats.totalVolume)}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 14, 
                                                    color: colors.text.secondary,
                                                    marginTop: 2,
                                                }}>
                                                    kg this week
                                                </Text>
                                            </View>

                                            <View style={{ 
                                                flex: 1,
                                                minWidth: "47%",
                                                backgroundColor: colors.status.success + '15',
                                                borderRadius: 12,
                                                padding: 16,
                                                borderWidth: 1,
                                                borderColor: colors.status.success + '30',
                                            }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                    <CheckCircle2 size={18} color={colors.status.success} />
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                        fontWeight: "500",
                                                        textTransform: "uppercase",
                                                        letterSpacing: 0.5,
                                                    }}>
                                                        Completed
                                                    </Text>
                                                </View>
                                                <Text style={{ 
                                                    fontSize: 24, 
                                                    fontWeight: "800", 
                                                    color: colors.status.success,
                                                    letterSpacing: -0.5,
                                                }}>
                                                    {summaryStats.completedDays}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 14, 
                                                    color: colors.text.secondary,
                                                    marginTop: 2,
                                                }}>
                                                    {summaryStats.completedDays === 1 ? 'day' : 'days'}
                                                </Text>
                                            </View>

                                            <View style={{ 
                                                flex: 1,
                                                minWidth: "47%",
                                                backgroundColor: colors.background.primary,
                                                borderRadius: 12,
                                                padding: 16,
                                                borderWidth: 1,
                                                borderColor: colors.border.light,
                                            }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                    <TrendingUp size={18} color={colors.primary[600]} />
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                        fontWeight: "500",
                                                        textTransform: "uppercase",
                                                        letterSpacing: 0.5,
                                                    }}>
                                                        Avg per Workout
                                                    </Text>
                                                </View>
                                                <Text style={{ 
                                                    fontSize: 24, 
                                                    fontWeight: "800", 
                                                    color: colors.text.primary,
                                                    letterSpacing: -0.5,
                                                }}>
                                                    {formatShortNumber(summaryStats.averageVolume)}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 14, 
                                                    color: colors.text.secondary,
                                                    marginTop: 2,
                                                }}>
                                                    kg
                                                </Text>
                                            </View>

                                            <View style={{ 
                                                flex: 1,
                                                minWidth: "47%",
                                                backgroundColor: colors.background.primary,
                                                borderRadius: 12,
                                                padding: 16,
                                                borderWidth: 1,
                                                borderColor: colors.border.light,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 12, 
                                                    color: colors.text.tertiary,
                                                    fontWeight: "500",
                                                    textTransform: "uppercase",
                                                    letterSpacing: 0.5,
                                                    marginBottom: 8,
                                                }}>
                                                    Consistency
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 24, 
                                                    fontWeight: "800", 
                                                    color: colors.text.primary,
                                                    letterSpacing: -0.5,
                                                }}>
                                                    {summaryStats.consistency.toFixed(0)}%
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 14, 
                                                    color: colors.text.secondary,
                                                    marginTop: 2,
                                                }}>
                                                    workout rate
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Volume Bar Chart */}
                                        {barChartData.length > 0 && (
                                            <View style={{ 
                                                backgroundColor: colors.background.primary,
                                                borderRadius: 12,
                                                padding: 16,
                                                marginBottom: 24,
                                                borderWidth: 1,
                                                borderColor: colors.border.light,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: "600", 
                                                    color: colors.text.primary,
                                                    marginBottom: 16 
                                                }}>
                                                    Daily Volume
                                                </Text>
                                                <BarChart
                                                    data={barChartData}
                                                    width={Dimensions.get("window").width - 100}
                                                    height={200}
                                                    barWidth={30}
                                                    initialSpacing={10}
                                                    spacing={20}
                                                    barBorderRadius={6}
                                                    showGradient
                                                    gradientColor={colors.primary[400]}
                                                    yAxisThickness={1}
                                                    xAxisThickness={1}
                                                    xAxisColor={colors.border.medium}
                                                    yAxisColor={colors.border.medium}
                                                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}
                                                    xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                                                    yAxisLabelWidth={40}
                                                    maxValue={Math.max(...barChartData.map(d => d.value)) * 1.1 || 1000}
                                                    noOfSections={4}
                                                    isAnimated
                                                    animationDuration={1000}
                                                    cappedBars
                                                    capColor={colors.primary[700]}
                                                    capThickness={3}
                                                    capRadius={3}
                                                    showValuesAsTopLabel
                                                    topLabelTextStyle={{ color: isDarkMode ? colors.text.white : colors.text.primary, fontSize: 9, fontWeight: '600' }}
                                                    topLabelContainerStyle={{ marginBottom: 6 }}
                                                    rulesColor={colors.border.light}
                                                    rulesType="solid"
                                                    dashGap={0}
                                                    hideRules={false}
                                                    showXAxisLabel={true}
                                                    xAxisLabelRotation={0}
                                                    xAxisLabelPosition="bottom"
                                                />
                                            </View>
                                        )}

                                        {/* Day-by-Day Breakdown */}
                                        <View>
                                            <Text style={{ 
                                                fontSize: 18, 
                                                fontWeight: "bold", 
                                                color: colors.text.primary,
                                                marginBottom: 16 
                                            }}>
                                                Day-by-Day Breakdown
                                            </Text>
                                            {weekData.map((day, index) => {
                                                const isToday = day.date.toDateString() === new Date().toDateString();
                                                
                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => handleDayPress(day)}
                                                        activeOpacity={day.completed ? 0.7 : 1}
                                                        disabled={!day.completed}
                                                        style={{
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            backgroundColor: colors.background.card,
                                                            borderRadius: 12,
                                                            padding: 16,
                                                            marginBottom: 12,
                                                            borderWidth: 1,
                                                            borderColor: isToday ? colors.primary[300] : colors.border.light,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 1 },
                                                            shadowOpacity: 0.05,
                                                            shadowRadius: 4,
                                                            elevation: 2,
                                                            opacity: day.completed ? 1 : 0.7,
                                                        }}
                                                    >
                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                                                            <View style={{
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: 12,
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                backgroundColor: day.completed 
                                                                    ? colors.status.success + '20' 
                                                                    : colors.background.primary,
                                                                borderWidth: 1,
                                                                borderColor: day.completed 
                                                                    ? colors.status.success + '40' 
                                                                    : colors.border.light,
                                                            }}>
                                                                {day.completed ? (
                                                                    <CheckCircle2 size={24} color={colors.status.success} />
                                                                ) : (
                                                                    <XCircle size={24} color={colors.text.tertiary} />
                                                                )}
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                    <Text style={{ 
                                                                        fontSize: 16, 
                                                                        fontWeight: "700", 
                                                                        color: colors.text.primary,
                                                                    }}>
                                                                        {day.day}
                                                                    </Text>
                                                                    {isToday && (
                                                                        <View style={{
                                                                            backgroundColor: colors.primary[100],
                                                                            paddingHorizontal: 8,
                                                                            paddingVertical: 2,
                                                                            borderRadius: 8,
                                                                        }}>
                                                                            <Text style={{
                                                                                fontSize: 10,
                                                                                fontWeight: "600",
                                                                                color: colors.primary[700],
                                                                                textTransform: "uppercase",
                                                                            }}>
                                                                                Today
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                                <Text style={{ 
                                                                    fontSize: 13, 
                                                                    color: colors.text.secondary 
                                                                }}>
                                                                    {day.fullDate}
                                                                </Text>
                                                                {day.completed && (
                                                                    <Text style={{ 
                                                                        fontSize: 11, 
                                                                        color: colors.primary[600],
                                                                        marginTop: 4,
                                                                        fontWeight: "500",
                                                                    }}>
                                                                        Tap to view details
                                                                    </Text>
                                                                )}
                                                            </View>
                                                        </View>
                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                            {day.completed && day.weight > 0 ? (
                                                                <>
                                                                    <View style={{ alignItems: "flex-end" }}>
                                                                        <Text style={{ 
                                                                            fontSize: 20, 
                                                                            fontWeight: "800", 
                                                                            color: colors.text.primary,
                                                                            letterSpacing: -0.5,
                                                                        }}>
                                                                            {formatShortNumber(day.weight)}
                                                                        </Text>
                                                                        <Text style={{ 
                                                                            fontSize: 12, 
                                                                            color: colors.text.secondary,
                                                                            marginTop: 2,
                                                                        }}>
                                                                            kg
                                                                        </Text>
                                                                    </View>
                                                                    <ChevronRight size={20} color={colors.primary[600]} />
                                                                </>
                                                            ) : (
                                                                <View style={{ alignItems: "flex-end" }}>
                                                                    <Text style={{ 
                                                                        fontSize: 13, 
                                                                        color: colors.text.tertiary,
                                                                        fontStyle: "italic",
                                                                    }}>
                                                                        No workout
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        {/* Best Day Highlight */}
                                        {summaryStats.bestDay && summaryStats.bestDay.weight > 0 && (
                                            <View style={{
                                                marginTop: 24,
                                                backgroundColor: colors.primary[50],
                                                borderRadius: 12,
                                                padding: 16,
                                                borderWidth: 1,
                                                borderColor: colors.primary[200],
                                            }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                    <TrendingUp size={18} color={colors.primary[600]} />
                                                    <Text style={{ 
                                                        fontSize: 14, 
                                                        fontWeight: "600", 
                                                        color: colors.text.primary,
                                                    }}>
                                                        Best Day
                                                    </Text>
                                                </View>
                                                <Text style={{ 
                                                    fontSize: 16, 
                                                    color: colors.text.secondary 
                                                }}>
                                                    {summaryStats.bestDay.day} - {formatShortNumber(summaryStats.bestDay.weight)} kg
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
            <WeeklyDayDetailModal
                visible={showDayDetailModal}
                onClose={() => setShowDayDetailModal(false)}
                dayDate={selectedDayDate}
                userId={userId}
            />
        </Modal>
    );
}
