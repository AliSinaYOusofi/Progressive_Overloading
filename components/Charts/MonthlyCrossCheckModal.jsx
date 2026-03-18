import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { GitCompare, Calendar, ChevronDown, Dumbbell, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { prepareMonthlyComparisonData } from "./utils/monthlyTrendsUtils";
import { formatShortNumber } from "../../utils/numberUtils";
import { MODAL_LAYOUT } from "../../constants/modal";

export default function MonthlyCrossCheckModal({ visible, onClose, monthlyStats }) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const screenWidth = Dimensions.get("window").width;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

    // State
    const [selectedMonth1, setSelectedMonth1] = useState(null);
    const [selectedMonth2, setSelectedMonth2] = useState(null);
    const [showMonthPicker1, setShowMonthPicker1] = useState(false);
    const [showMonthPicker2, setShowMonthPicker2] = useState(false);
    const [comparisonData, setComparisonData] = useState([]);
    const [month1Display, setMonth1Display] = useState(null);
    const [month2Display, setMonth2Display] = useState(null);
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

    // Get available months from monthlyStats
    const availableMonths = monthlyStats 
        ? monthlyStats
            .filter(m => m && m.month && typeof m.month === 'string')
            .map(m => m.month)
            .sort((a, b) => {
                const dateA = new Date(a + "-01");
                const dateB = new Date(b + "-01");
                return dateB - dateA; // Most recent first
            })
        : [];

    // Format month for display
    const formatMonthDisplay = (monthStr) => {
        if (!monthStr) return "Select Month";
        try {
            const date = new Date(monthStr + "-01");
            return date.toLocaleDateString("en", { 
                month: "long", 
                year: "numeric"
            });
        } catch {
            return monthStr;
        }
    };

    // Reset state when modal becomes visible
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
            setSelectedMonth1(null);
            setSelectedMonth2(null);
            setComparisonData([]);
            setMonth1Display(null);
            setMonth2Display(null);
            setHasCompared(false);
        }
    }, [visible, translateY]);

    // Handle month selection from dropdown
    const handleMonth1Select = (monthStr) => {
        setSelectedMonth1(monthStr);
        setMonth1Display(formatMonthDisplay(monthStr));
        setShowMonthPicker1(false);
        // Clear second month if it matches the newly selected first month
        if (selectedMonth2 === monthStr) {
            setSelectedMonth2(null);
            setMonth2Display(null);
        }
    };

    const handleMonth2Select = (monthStr) => {
        setSelectedMonth2(monthStr);
        setMonth2Display(formatMonthDisplay(monthStr));
        setShowMonthPicker2(false);
    };

    // Handle compare button
    const handleCompare = () => {
        if (!selectedMonth1 || !selectedMonth2 || !monthlyStats) {
            return;
        }

        const comparison = prepareMonthlyComparisonData(monthlyStats, selectedMonth1, selectedMonth2);
        setComparisonData(comparison);
        setHasCompared(true);
    };

    // Calculate max value for chart scaling
    const getMaxChartValue = () => {
        if (!comparisonData || comparisonData.length === 0) {
            return 1000;
        }
        const maxVolume = Math.max(
            ...comparisonData.map(d => Math.max(d.month1Volume, d.month2Volume))
        );
        return maxVolume * 1.1;
    };

    const maxChartValue = getMaxChartValue();


    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
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
                                            Monthly Cross Check
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
                                {/* Month Selection UI */}
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={{ 
                                        fontSize: 16, 
                                        fontWeight: "600", 
                                        color: colors.text.primary,
                                        marginBottom: 16 
                                    }}>
                                        Select Two Months to Compare
                                    </Text>
                                    
                                    <View style={{ gap: 12, marginBottom: 16 }}>
                                        {/* Month 1 Picker */}
                                        <View>
                                            <Text style={{ 
                                                fontSize: 12, 
                                                color: colors.text.secondary,
                                                marginBottom: 6,
                                                fontWeight: "500"
                                            }}>
                                                First Month
                                            </Text>
                                            <View style={{ position: "relative" }}>
                                                <TouchableOpacity
                                                    onPress={() => setShowMonthPicker1(!showMonthPicker1)}
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 14,
                                                        backgroundColor: colors.background.primary,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: showMonthPicker1 ? colors.primary[600] : colors.border.light,
                                                    }}
                                                >
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                                        <Calendar size={18} color={colors.primary[600]} />
                                                        <Text style={{ 
                                                            fontSize: 15, 
                                                            color: month1Display ? colors.text.primary : colors.text.tertiary,
                                                            fontWeight: month1Display ? "600" : "400"
                                                        }}>
                                                            {month1Display || "Select Month"}
                                                        </Text>
                                                    </View>
                                                    <ChevronDown size={18} color={colors.text.tertiary} />
                                                </TouchableOpacity>

                                                {/* Month Dropdown */}
                                                {showMonthPicker1 && (
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
                                                            onPress={() => setShowMonthPicker1(false)}
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
                                                                {availableMonths
                                                                    .filter(monthStr => monthStr !== selectedMonth2)
                                                                    .map((monthStr, index) => {
                                                                        const formatted = formatMonthDisplay(monthStr);
                                                                        const isSelected = selectedMonth1 === monthStr;
                                                                        const filteredMonths = availableMonths.filter(m => m !== selectedMonth2);
                                                                        return (
                                                                            <TouchableOpacity
                                                                                key={index}
                                                                                onPress={() => handleMonth1Select(monthStr)}
                                                                                style={{
                                                                                    paddingHorizontal: 16,
                                                                                    paddingVertical: 12,
                                                                                    backgroundColor: isSelected ? colors.primary[50] : "transparent",
                                                                                    borderBottomWidth: index < filteredMonths.length - 1 ? 1 : 0,
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

                                        {/* Month 2 Picker */}
                                        <View>
                                            <Text style={{ 
                                                fontSize: 12, 
                                                color: colors.text.secondary,
                                                marginBottom: 6,
                                                fontWeight: "500"
                                            }}>
                                                Second Month
                                            </Text>
                                            <View style={{ position: "relative" }}>
                                                <TouchableOpacity
                                                    onPress={() => setShowMonthPicker2(!showMonthPicker2)}
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 14,
                                                        backgroundColor: colors.background.primary,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: showMonthPicker2 ? colors.primary[600] : colors.border.light,
                                                    }}
                                                >
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                                        <Calendar size={18} color={colors.primary[600]} />
                                                        <Text style={{ 
                                                            fontSize: 15, 
                                                            color: month2Display ? colors.text.primary : colors.text.tertiary,
                                                            fontWeight: month2Display ? "600" : "400"
                                                        }}>
                                                            {month2Display || "Select Month"}
                                                        </Text>
                                                    </View>
                                                    <ChevronDown size={18} color={colors.text.tertiary} />
                                                </TouchableOpacity>

                                                {/* Month Dropdown */}
                                                {showMonthPicker2 && (
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
                                                            onPress={() => setShowMonthPicker2(false)}
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
                                                                {availableMonths
                                                                    .filter(monthStr => monthStr !== selectedMonth1)
                                                                    .map((monthStr, index) => {
                                                                        const formatted = formatMonthDisplay(monthStr);
                                                                        const isSelected = selectedMonth2 === monthStr;
                                                                        const filteredMonths = availableMonths.filter(m => m !== selectedMonth1);
                                                                        return (
                                                                            <TouchableOpacity
                                                                                key={index}
                                                                                onPress={() => handleMonth2Select(monthStr)}
                                                                                style={{
                                                                                    paddingHorizontal: 16,
                                                                                    paddingVertical: 12,
                                                                                    backgroundColor: isSelected ? colors.primary[50] : "transparent",
                                                                                    borderBottomWidth: index < filteredMonths.length - 1 ? 1 : 0,
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
                                        disabled={!selectedMonth1 || !selectedMonth2}
                                        style={{
                                            paddingVertical: 14,
                                            paddingHorizontal: 20,
                                            borderRadius: 12,
                                            backgroundColor: (selectedMonth1 && selectedMonth2) 
                                                ? colors.primary[600] 
                                                : colors.background.primary,
                                            borderWidth: 1,
                                            borderColor: (selectedMonth1 && selectedMonth2) 
                                                ? colors.primary[600] 
                                                : colors.border.light,
                                            alignItems: "center",
                                            opacity: (selectedMonth1 && selectedMonth2) ? 1 : 0.5,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: (selectedMonth1 && selectedMonth2) ? "white" : colors.text.tertiary,
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
                                                        {month1Display}
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
                                                        {month2Display}
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
                                                            const barHeight1 = (item.month1Volume / maxChartValue) * 260;
                                                            const barHeight2 = (item.month2Volume / maxChartValue) * 260;
                                                            
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
                                                                        {/* Month 1 bar */}
                                                                        <View style={{ alignItems: "center" }}>
                                                                            <Text style={{ 
                                                                                fontSize: 8, 
                                                                                color: colors.text.secondary, 
                                                                                marginBottom: 4,
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {formatShortNumber(item.month1Volume)}
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
                                                                        
                                                                        {/* Month 2 bar */}
                                                                        <View style={{ alignItems: "center" }}>
                                                                            <Text style={{ 
                                                                                fontSize: 8, 
                                                                                color: colors.text.secondary, 
                                                                                marginBottom: 4,
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {formatShortNumber(item.month2Volume)}
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
                                                const isIncrease = item.month2Volume > item.month1Volume;
                                                const isDecrease = item.month2Volume < item.month1Volume;
                                                const isStable = item.month2Volume === item.month1Volume;
                                                const change = item.month2Volume - item.month1Volume;
                                                const changePercent = item.month1Volume > 0 
                                                    ? ((change / item.month1Volume) * 100).toFixed(1)
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
                                                            {/* Month 1 Volume */}
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
                                                                    {month1Display}
                                                                </Text>
                                                                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                                                                    <Text style={{ 
                                                                        fontSize: 24, 
                                                                        fontWeight: "800", 
                                                                        color: colors.primary[700],
                                                                        letterSpacing: -0.5,
                                                                    }}>
                                                                        {formatShortNumber(item.month1Volume)}
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

                                                            {/* Month 2 Volume */}
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
                                                                    {month2Display}
                                                                </Text>
                                                                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                                                                    <Text style={{ 
                                                                        fontSize: 24, 
                                                                        fontWeight: "800", 
                                                                        color: colors.status.info,
                                                                        letterSpacing: -0.5,
                                                                    }}>
                                                                        {formatShortNumber(item.month2Volume)}
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
                                            These months don't have any exercises in common
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
