import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { GitCompare, Calendar, ChevronDown, Dumbbell, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { prepareWeeklyComparisonData } from "./utils/weeklyProgressUtils";
import { formatShortNumber } from "../../utils/numberUtils";

export default function WeeklyCrossCheckModal({ visible, onClose, weeklyStats }) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const screenWidth = Dimensions.get("window").width;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

    // State
    const [selectedWeek1, setSelectedWeek1] = useState(null);
    const [selectedWeek2, setSelectedWeek2] = useState(null);
    const [showWeekPicker1, setShowWeekPicker1] = useState(false);
    const [showWeekPicker2, setShowWeekPicker2] = useState(false);
    const [comparisonData, setComparisonData] = useState([]);
    const [week1Display, setWeek1Display] = useState(null);
    const [week2Display, setWeek2Display] = useState(null);
    const [hasCompared, setHasCompared] = useState(false);

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

    // Get available weeks from weeklyStats
    const availableWeeks = weeklyStats 
        ? weeklyStats
            .filter(w => w && w.week && typeof w.week === 'string')
            .map(w => w.week)
            .sort((a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateB - dateA; // Most recent first
            })
        : [];

    // Format week for display
    const formatWeekDisplay = (weekStr) => {
        if (!weekStr) return "Select Week";
        try {
            const date = new Date(weekStr);
            const endDate = new Date(date);
            endDate.setDate(date.getDate() + 6);
            
            const startMonth = date.toLocaleDateString("en", { month: "short" });
            const startDay = date.getDate();
            const endMonth = endDate.toLocaleDateString("en", { month: "short" });
            const endDay = endDate.getDate();
            const year = date.getFullYear();
            
            if (startMonth === endMonth) {
                return `${startMonth} ${startDay}-${endDay}, ${year}`;
            } else {
                return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
            }
        } catch {
            return weekStr;
        }
    };

    // Reset state when modal becomes visible
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
            setSelectedWeek1(null);
            setSelectedWeek2(null);
            setComparisonData([]);
            setWeek1Display(null);
            setWeek2Display(null);
            setHasCompared(false);
        }
    }, [visible, translateY]);

    // Handle week selection from dropdown
    const handleWeek1Select = (weekStr) => {
        setSelectedWeek1(weekStr);
        setWeek1Display(formatWeekDisplay(weekStr));
        setShowWeekPicker1(false);
        // Clear second week if it matches the newly selected first week
        if (selectedWeek2 === weekStr) {
            setSelectedWeek2(null);
            setWeek2Display(null);
        }
    };

    const handleWeek2Select = (weekStr) => {
        setSelectedWeek2(weekStr);
        setWeek2Display(formatWeekDisplay(weekStr));
        setShowWeekPicker2(false);
    };

    // Handle compare button
    const handleCompare = () => {
        if (!selectedWeek1 || !selectedWeek2 || !weeklyStats) {
            return;
        }

        const comparison = prepareWeeklyComparisonData(weeklyStats, selectedWeek1, selectedWeek2);
        setComparisonData(comparison);
        setHasCompared(true);
    };

    // Calculate max value for chart scaling
    const getMaxChartValue = () => {
        if (!comparisonData || comparisonData.length === 0) {
            return 1000;
        }
        const maxVolume = Math.max(
            ...comparisonData.map(d => Math.max(d.week1Volume, d.week2Volume))
        );
        return maxVolume * 1.1;
    };

    const maxChartValue = getMaxChartValue();


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
                                        <GitCompare size={20} color={colors.primary[600]} />
                                    </View>
                                    <View>
                                        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                                            Weekly Cross Check
                                        </Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
                                            Compare exercise volumes
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
                                {/* Week Selection UI */}
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={{ 
                                        fontSize: 16, 
                                        fontWeight: "600", 
                                        color: colors.text.primary,
                                        marginBottom: 16 
                                    }}>
                                        Select Two Weeks to Compare
                                    </Text>
                                    
                                    <View style={{ gap: 12, marginBottom: 16 }}>
                                        {/* Week 1 Picker */}
                                        <View>
                                            <Text style={{ 
                                                fontSize: 12, 
                                                color: colors.text.secondary,
                                                marginBottom: 6,
                                                fontWeight: "500"
                                            }}>
                                                First Week
                                            </Text>
                                            <View style={{ position: "relative" }}>
                                                <TouchableOpacity
                                                    onPress={() => setShowWeekPicker1(!showWeekPicker1)}
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 14,
                                                        backgroundColor: colors.background.primary,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: showWeekPicker1 ? colors.primary[600] : colors.border.light,
                                                    }}
                                                >
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                                        <Calendar size={18} color={colors.primary[600]} />
                                                        <Text style={{ 
                                                            fontSize: 15, 
                                                            color: week1Display ? colors.text.primary : colors.text.tertiary,
                                                            fontWeight: week1Display ? "600" : "400"
                                                        }}>
                                                            {week1Display || "Select Week"}
                                                        </Text>
                                                    </View>
                                                    <ChevronDown size={18} color={colors.text.tertiary} />
                                                </TouchableOpacity>

                                                {/* Week Dropdown */}
                                                {showWeekPicker1 && (
                                                    <>
                                                        <TouchableOpacity
                                                            style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: -300,
                                                                zIndex: 999,
                                                            }}
                                                            activeOpacity={1}
                                                            onPress={() => setShowWeekPicker1(false)}
                                                        />
                                                        <View style={{
                                                            position: "absolute",
                                                            top: "100%",
                                                            left: 0,
                                                            right: 0,
                                                            marginTop: 4,
                                                            backgroundColor: colors.background.card,
                                                            borderRadius: 12,
                                                            borderWidth: 1,
                                                            borderColor: colors.border.light,
                                                            maxHeight: 200,
                                                            zIndex: 1000,
                                                            shadowColor: "#000",
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.1,
                                                            shadowRadius: 8,
                                                            elevation: 5,
                                                        }}>
                                                            <ScrollView 
                                                                nestedScrollEnabled
                                                                style={{ maxHeight: 200 }}
                                                            >
                                                                {availableWeeks
                                                                    .filter(weekStr => weekStr !== selectedWeek2)
                                                                    .map((weekStr, index) => {
                                                                        const formatted = formatWeekDisplay(weekStr);
                                                                        const isSelected = selectedWeek1 === weekStr;
                                                                        const filteredWeeks = availableWeeks.filter(w => w !== selectedWeek2);
                                                                        return (
                                                                            <TouchableOpacity
                                                                                key={index}
                                                                                onPress={() => handleWeek1Select(weekStr)}
                                                                                style={{
                                                                                    paddingHorizontal: 16,
                                                                                    paddingVertical: 12,
                                                                                    backgroundColor: isSelected ? colors.primary[50] : "transparent",
                                                                                    borderBottomWidth: index < filteredWeeks.length - 1 ? 1 : 0,
                                                                                    borderBottomColor: colors.border.light,
                                                                                }}
                                                                            >
                                                                                <Text style={{
                                                                                    fontSize: 14,
                                                                                    color: isSelected ? colors.primary[600] : colors.text.primary,
                                                                                    fontWeight: isSelected ? "600" : "400"
                                                                                }}>
                                                                                    {formatted}
                                                                                </Text>
                                                                            </TouchableOpacity>
                                                                        );
                                                                    })}
                                                            </ScrollView>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        </View>

                                        {/* Week 2 Picker */}
                                        <View>
                                            <Text style={{ 
                                                fontSize: 12, 
                                                color: colors.text.secondary,
                                                marginBottom: 6,
                                                fontWeight: "500"
                                            }}>
                                                Second Week
                                            </Text>
                                            <View style={{ position: "relative" }}>
                                                <TouchableOpacity
                                                    onPress={() => setShowWeekPicker2(!showWeekPicker2)}
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 14,
                                                        backgroundColor: colors.background.primary,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: showWeekPicker2 ? colors.primary[600] : colors.border.light,
                                                    }}
                                                >
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                                        <Calendar size={18} color={colors.primary[600]} />
                                                        <Text style={{ 
                                                            fontSize: 15, 
                                                            color: week2Display ? colors.text.primary : colors.text.tertiary,
                                                            fontWeight: week2Display ? "600" : "400"
                                                        }}>
                                                            {week2Display || "Select Week"}
                                                        </Text>
                                                    </View>
                                                    <ChevronDown size={18} color={colors.text.tertiary} />
                                                </TouchableOpacity>

                                                {/* Week Dropdown */}
                                                {showWeekPicker2 && (
                                                    <>
                                                        <TouchableOpacity
                                                            style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: -300,
                                                                zIndex: 999,
                                                            }}
                                                            activeOpacity={1}
                                                            onPress={() => setShowWeekPicker2(false)}
                                                        />
                                                        <View style={{
                                                            position: "absolute",
                                                            top: "100%",
                                                            left: 0,
                                                            right: 0,
                                                            marginTop: 4,
                                                            backgroundColor: colors.background.card,
                                                            borderRadius: 12,
                                                            borderWidth: 1,
                                                            borderColor: colors.border.light,
                                                            maxHeight: 200,
                                                            zIndex: 1000,
                                                            shadowColor: "#000",
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.1,
                                                            shadowRadius: 8,
                                                            elevation: 5,
                                                        }}>
                                                            <ScrollView 
                                                                nestedScrollEnabled
                                                                style={{ maxHeight: 200 }}
                                                            >
                                                                {availableWeeks
                                                                    .filter(weekStr => weekStr !== selectedWeek1)
                                                                    .map((weekStr, index) => {
                                                                        const formatted = formatWeekDisplay(weekStr);
                                                                        const isSelected = selectedWeek2 === weekStr;
                                                                        const filteredWeeks = availableWeeks.filter(w => w !== selectedWeek1);
                                                                        return (
                                                                            <TouchableOpacity
                                                                                key={index}
                                                                                onPress={() => handleWeek2Select(weekStr)}
                                                                                style={{
                                                                                    paddingHorizontal: 16,
                                                                                    paddingVertical: 12,
                                                                                    backgroundColor: isSelected ? colors.primary[50] : "transparent",
                                                                                    borderBottomWidth: index < filteredWeeks.length - 1 ? 1 : 0,
                                                                                    borderBottomColor: colors.border.light,
                                                                                }}
                                                                            >
                                                                                <Text style={{
                                                                                    fontSize: 14,
                                                                                    color: isSelected ? colors.primary[600] : colors.text.primary,
                                                                                    fontWeight: isSelected ? "600" : "400"
                                                                                }}>
                                                                                    {formatted}
                                                                                </Text>
                                                                            </TouchableOpacity>
                                                                        );
                                                                    })}
                                                            </ScrollView>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Compare Button */}
                                    <TouchableOpacity
                                        onPress={handleCompare}
                                        disabled={!selectedWeek1 || !selectedWeek2}
                                        style={{
                                            paddingVertical: 14,
                                            paddingHorizontal: 20,
                                            borderRadius: 12,
                                            backgroundColor: (selectedWeek1 && selectedWeek2) 
                                                ? colors.primary[600] 
                                                : colors.background.primary,
                                            borderWidth: 1,
                                            borderColor: (selectedWeek1 && selectedWeek2) 
                                                ? colors.primary[600] 
                                                : colors.border.light,
                                            alignItems: "center",
                                            opacity: (selectedWeek1 && selectedWeek2) ? 1 : 0.5,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: (selectedWeek1 && selectedWeek2) ? "white" : colors.text.tertiary,
                                        }}>
                                            Compare
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Comparison Chart */}
                                {comparisonData.length > 0 ? (
                                    <View>
                                        <View style={{ 
                                            marginBottom: 16 
                                        }}>
                                            <Text style={{ 
                                                fontSize: 18, 
                                                fontWeight: "bold", 
                                                color: colors.text.primary,
                                                marginBottom: 8
                                            }}>
                                                Exercise Comparison
                                            </Text>
                                            <View style={{ flexDirection: "column", gap: 8 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                    <View style={{ 
                                                        width: 12, 
                                                        height: 12, 
                                                        borderRadius: 2, 
                                                        backgroundColor: colors.primary[600] 
                                                    }} />
                                                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                                                        {week1Display}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                    <View style={{ 
                                                        width: 12, 
                                                        height: 12, 
                                                        borderRadius: 2, 
                                                        backgroundColor: colors.status.info 
                                                    }} />
                                                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                                                        {week2Display}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <ScrollView 
                                            horizontal 
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{ paddingRight: 20 }}
                                        >
                                            <View style={{ 
                                                backgroundColor: colors.background.primary, 
                                                borderRadius: 12, 
                                                padding: 16,
                                                paddingTop: 20,
                                                paddingBottom: 20,
                                                width: Math.max(
                                                    screenWidth - 80,
                                                    comparisonData.length * (comparisonData.length > 5 ? 58 : 68) + 65
                                                ),
                                            }}>
                                                {/* Custom Grouped Bar Chart */}
                                                <View style={{ height: 300, marginBottom: 20 }}>
                                                    {/* Y-axis labels */}
                                                    <View style={{ 
                                                        position: "absolute", 
                                                        left: 0, 
                                                        top: 0, 
                                                        bottom: 40, 
                                                        width: 40,
                                                        justifyContent: "space-between",
                                                        paddingRight: 8,
                                                    }}>
                                                        {[5, 4, 3, 2, 1, 0].map((section) => {
                                                            const value = (maxChartValue / 5) * section;
                                                            return (
                                                                <Text 
                                                                    key={section}
                                                                    style={{ 
                                                                        fontSize: 10, 
                                                                        color: colors.text.tertiary, 
                                                                        textAlign: "right",
                                                                        fontWeight: '500'
                                                                    }}
                                                                >
                                                                    {formatShortNumber(value)}
                                                                </Text>
                                                            );
                                                        })}
                                                    </View>

                                                    {/* Bars container */}
                                                    <View style={{ 
                                                        marginLeft: 45, 
                                                        marginRight: 10, 
                                                        height: 260,
                                                        flexDirection: "row",
                                                        alignItems: "flex-end",
                                                        justifyContent: "flex-start",
                                                        gap: comparisonData.length > 5 ? 8 : 12,
                                                    }}>
                                                        {comparisonData.map((item, index) => {
                                                            const barHeight1 = (item.week1Volume / maxChartValue) * 260;
                                                            const barHeight2 = (item.week2Volume / maxChartValue) * 260;
                                                            
                                                            return (
                                                                <View 
                                                                    key={index}
                                                                    style={{ 
                                                                        alignItems: "center",
                                                                        width: comparisonData.length > 5 ? 50 : 60,
                                                                    }}
                                                                >
                                                                    {/* Grouped bars */}
                                                                    <View style={{ 
                                                                        flexDirection: "row", 
                                                                        alignItems: "flex-end",
                                                                        gap: 4,
                                                                        height: 260,
                                                                        justifyContent: "center",
                                                                    }}>
                                                                        {/* Week 1 bar */}
                                                                        <View style={{ alignItems: "center" }}>
                                                                            <Text style={{ 
                                                                                fontSize: 8, 
                                                                                color: colors.text.secondary, 
                                                                                marginBottom: 4,
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {formatShortNumber(item.week1Volume)}
                                                                            </Text>
                                                                            <View style={{
                                                                                width: 20,
                                                                                height: Math.max(barHeight1, 4),
                                                                                backgroundColor: colors.primary[600],
                                                                                borderRadius: 4,
                                                                                borderBottomLeftRadius: 0,
                                                                                borderBottomRightRadius: 0,
                                                                            }} />
                                                                        </View>
                                                                        
                                                                        {/* Week 2 bar */}
                                                                        <View style={{ alignItems: "center" }}>
                                                                            <Text style={{ 
                                                                                fontSize: 8, 
                                                                                color: colors.text.secondary, 
                                                                                marginBottom: 4,
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {formatShortNumber(item.week2Volume)}
                                                                            </Text>
                                                                            <View style={{
                                                                                width: 20,
                                                                                height: Math.max(barHeight2, 4),
                                                                                backgroundColor: colors.status.info,
                                                                                borderRadius: 4,
                                                                                borderBottomLeftRadius: 0,
                                                                                borderBottomRightRadius: 0,
                                                                            }} />
                                                                        </View>
                                                                    </View>
                                                                    
                                                                    {/* X-axis label */}
                                                                    <Text 
                                                                        style={{ 
                                                                            fontSize: 9, 
                                                                            color: colors.text.tertiary, 
                                                                            marginTop: 8,
                                                                            textAlign: "center",
                                                                            fontWeight: '500'
                                                                        }}
                                                                        numberOfLines={2}
                                                                    >
                                                                        {item.exercise.length > 10 
                                                                            ? item.exercise.substring(0, 10) + '...' 
                                                                            : item.exercise}
                                                                    </Text>
                                                                </View>
                                                            );
                                                        })}
                                                    </View>

                                                    {/* Horizontal grid lines */}
                                                    {[1, 2, 3, 4, 5].map((line) => (
                                                        <View
                                                            key={line}
                                                            style={{
                                                                position: "absolute",
                                                                left: 45,
                                                                right: 10,
                                                                top: 40 + ((260 / 5) * (line - 1)),
                                                                height: 1,
                                                                backgroundColor: colors.border.light,
                                                            }}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                        </ScrollView>

                                        {/* Exercise List */}
                                        <View style={{ marginTop: 24 }}>
                                            <Text style={{ 
                                                fontSize: 18, 
                                                fontWeight: "bold", 
                                                color: colors.text.primary,
                                                marginBottom: 16 
                                            }}>
                                                Exercise Details
                                            </Text>
                                            {comparisonData.map((item, index) => {
                                                const isIncrease = item.week2Volume > item.week1Volume;
                                                const isDecrease = item.week2Volume < item.week1Volume;
                                                const isStable = item.week2Volume === item.week1Volume;
                                                const change = item.week2Volume - item.week1Volume;
                                                const changePercent = item.week1Volume > 0 
                                                    ? ((change / item.week1Volume) * 100).toFixed(1)
                                                    : 0;
                                                
                                                const ProgressIcon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : Minus;
                                                const progressColor = isIncrease ? colors.status.success : isDecrease ? colors.status.error : colors.text.tertiary;
                                                
                                                return (
                                                    <View
                                                        key={index}
                                                        style={{
                                                            backgroundColor: colors.background.card,
                                                            borderRadius: 16,
                                                            padding: 18,
                                                            marginBottom: 14,
                                                            borderWidth: 1,
                                                            borderColor: colors.border.light,
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.06,
                                                            shadowRadius: 8,
                                                            elevation: 3,
                                                        }}
                                                    >
                                                        {/* Header: Exercise Name and Change Badge */}
                                                        <View style={{ 
                                                            flexDirection: "row", 
                                                            alignItems: "flex-start", 
                                                            justifyContent: "space-between",
                                                            marginBottom: 16,
                                                        }}>
                                                            <View style={{ flex: 1, marginRight: 12 }}>
                                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                    <Dumbbell size={18} color={colors.primary[600]} />
                                                                    <Text style={{ 
                                                                        fontSize: 17, 
                                                                        fontWeight: "700", 
                                                                        color: colors.text.primary,
                                                                        letterSpacing: -0.3,
                                                                    }}>
                                                                        {item.exercise}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            
                                                            {/* Change Badge */}
                                                            <View style={{ 
                                                                flexDirection: "row", 
                                                                alignItems: "center", 
                                                                gap: 4,
                                                                backgroundColor: progressColor + '20',
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 6,
                                                                borderRadius: 12,
                                                                borderWidth: 1,
                                                                borderColor: progressColor + '40',
                                                            }}>
                                                                <ProgressIcon size={14} color={progressColor} strokeWidth={2.5} />
                                                                <Text style={{ 
                                                                    fontSize: 13, 
                                                                    fontWeight: "700", 
                                                                    color: progressColor,
                                                                    letterSpacing: -0.2,
                                                                }}>
                                                                    {isIncrease ? "+" : ""}{changePercent}%
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        {/* Volume Comparison */}
                                                        <View style={{ 
                                                            flexDirection: "row", 
                                                            gap: 12,
                                                            marginBottom: 12,
                                                        }}>
                                                            {/* Week 1 Volume */}
                                                            <View style={{ 
                                                                flex: 1,
                                                                backgroundColor: colors.primary[50],
                                                                borderRadius: 12,
                                                                padding: 14,
                                                                borderWidth: 1,
                                                                borderColor: colors.primary[200],
                                                            }}>
                                                                <Text style={{ 
                                                                    fontSize: 11, 
                                                                    color: colors.text.tertiary,
                                                                    fontWeight: "500",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 0.5,
                                                                    marginBottom: 6,
                                                                }}>
                                                                    {week1Display}
                                                                </Text>
                                                                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                                                                    <Text style={{ 
                                                                        fontSize: 24, 
                                                                        fontWeight: "800", 
                                                                        color: colors.primary[700],
                                                                        letterSpacing: -0.5,
                                                                    }}>
                                                                        {formatShortNumber(item.week1Volume)}
                                                                    </Text>
                                                                    <Text style={{ 
                                                                        fontSize: 14, 
                                                                        fontWeight: "600", 
                                                                        color: colors.text.secondary,
                                                                        marginBottom: 2,
                                                                    }}>
                                                                        kg
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {/* Week 2 Volume */}
                                                            <View style={{ 
                                                                flex: 1,
                                                                backgroundColor: colors.status.info + '15',
                                                                borderRadius: 12,
                                                                padding: 14,
                                                                borderWidth: 1,
                                                                borderColor: colors.status.info + '30',
                                                            }}>
                                                                <Text style={{ 
                                                                    fontSize: 11, 
                                                                    color: colors.text.tertiary,
                                                                    fontWeight: "500",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 0.5,
                                                                    marginBottom: 6,
                                                                }}>
                                                                    {week2Display}
                                                                </Text>
                                                                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                                                                    <Text style={{ 
                                                                        fontSize: 24, 
                                                                        fontWeight: "800", 
                                                                        color: colors.status.info,
                                                                        letterSpacing: -0.5,
                                                                    }}>
                                                                        {formatShortNumber(item.week2Volume)}
                                                                    </Text>
                                                                    <Text style={{ 
                                                                        fontSize: 14, 
                                                                        fontWeight: "600", 
                                                                        color: colors.text.secondary,
                                                                        marginBottom: 2,
                                                                    }}>
                                                                        kg
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        {/* Change Details */}
                                                        <View style={{ 
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            paddingTop: 12,
                                                            borderTopWidth: 1,
                                                            borderTopColor: colors.border.light,
                                                        }}>
                                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                                <ProgressIcon size={14} color={progressColor} />
                                                                <Text style={{ 
                                                                    fontSize: 12, 
                                                                    color: colors.text.secondary,
                                                                    fontWeight: "500",
                                                                }}>
                                                                    Change:
                                                                </Text>
                                                                <Text style={{ 
                                                                    fontSize: 13, 
                                                                    fontWeight: "700", 
                                                                    color: progressColor,
                                                                }}>
                                                                    {isIncrease ? "+" : ""}{formatShortNumber(change)} kg
                                                                </Text>
                                                            </View>
                                                            <Text style={{ 
                                                                fontSize: 11, 
                                                                color: colors.text.tertiary,
                                                                fontStyle: "italic",
                                                            }}>
                                                                {isIncrease ? "Increased" : isDecrease ? "Decreased" : "No change"}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                ) : hasCompared ? (
                                    <View style={{ 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        paddingVertical: 60 
                                    }}>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            color: colors.text.secondary 
                                        }}>
                                            No common exercises found
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 14, 
                                            color: colors.text.tertiary,
                                            marginTop: 8,
                                            textAlign: 'center',
                                        }}>
                                            These weeks don't have any exercises in common
                                        </Text>
                                    </View>
                                ) : null}
                            </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

