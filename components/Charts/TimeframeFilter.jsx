import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Platform, ScrollView, Dimensions } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, X, ChevronDown, Check } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { colorScheme } from "nativewind";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { format, differenceInDays } from "date-fns";
import { MODAL_LAYOUT } from "../../constants/modal";

export default function TimeframeFilter({ selectedTimeframe, onTimeframeChange, onCustomDateRange }) {
    const colors = useThemedColors();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [dateError, setDateError] = useState('');
    const [customDateRange, setCustomDateRange] = useState(null); // Store custom date range
    const customDateRangeRef = useRef(null); // Ref to persist dates across re-renders
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

    // Define close function in RN Runtime scope (required for scheduleOnRN)
    const handleClose = useCallback(() => {
        setShowCustomModal(false);
    }, []);

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
        if (showCustomModal) {
            translateY.value = 0;
        }
    }, [showCustomModal, translateY]);

    const timeframeItems = [
        { label: "7 Days", value: 7 },
        { label: "1 Month", value: 30 },
        { label: "3 Months", value: 90 },
        { label: "6 Months", value: 180 },
        { label: "All Time", value: 'all' },
        { label: "Custom", value: 'custom' }
    ];

    const presetValues = [7, 30, 90, 180, 'all', 'custom'];

    // Check if selectedTimeframe is a custom date range (not a preset value)
    const isCustomDateRange = typeof selectedTimeframe === 'number' && !presetValues.includes(selectedTimeframe);

    const getSelectedLabel = () => {
        if (isCustomDateRange) {
            return "Custom";
        }
        const option = timeframeItems.find(opt => opt.value === selectedTimeframe);
        return option ? option.label : "Select time period";
    };

    const handleOptionSelect = (option) => {
        if (option.value === 'custom') {
            setShowDropdown(false);
            setShowCustomModal(true);
        } else {
            // Reset custom date range when selecting a preset
            setCustomDateRange(null);
            onTimeframeChange(option.value);
            setShowDropdown(false);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const validateDates = () => {
        setDateError('');
        
        if (startDate > endDate) {
            setDateError('Start date must be before end date');
            return false;
        }

        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (daysDiff > 365) {
            setDateError('Date range cannot exceed 1 year');
            return false;
        }

        if (daysDiff < 1) {
            setDateError('Date range must be at least 1 day');
            return false;
        }

        return true;
    };

    const handleApplyCustomDates = () => {
        if (validateDates()) {
            // Store the custom date range for display - create new Date objects to avoid reference issues
            const customRange = { 
                startDate: new Date(startDate.getTime()), 
                endDate: new Date(endDate.getTime()) 
            };
            // Store in both state and ref to ensure persistence
            customDateRangeRef.current = customRange;
            setCustomDateRange(customRange);
            // Call parent callback after state is set
            onCustomDateRange?.(startDate, endDate);
            setShowCustomModal(false);
        }
    };


    return (
        <>
            <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 12 }}>Time Period</Text>
                
                {/* Dropdown Button */}
                <TouchableOpacity
                    onPress={() => setShowDropdown(true)}
                    style={{
                        backgroundColor: colors.background.card,
                        borderWidth: 1,
                        borderColor: showDropdown ? colors.primary[600] : colors.border.light,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <Text style={{ 
                        fontSize: 16, 
                        color: colors.text.primary, 
                        fontWeight: "500",
                        flex: 1,
                    }}>
                        {getSelectedLabel()}
                    </Text>
                    <ChevronDown size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                
                {/* Custom Date Range Display */}
                {isCustomDateRange && (() => {
                    // Use customDateRange state first, then ref as fallback, then startDate/endDate state
                    const dateRange = customDateRange || customDateRangeRef.current || (startDate && endDate ? { startDate, endDate } : null);
                    
                    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
                        return null;
                    }
                    
                    try {
                        const start = new Date(dateRange.startDate);
                        const end = new Date(dateRange.endDate);
                        // Check if dates are valid
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            return null;
                        }
                        const daysDiff = differenceInDays(end, start);
                        const daysText = daysDiff === 1 ? 'day' : 'days';
                        return (
                            <Text style={{ 
                                fontSize: 13, 
                                color: colors.text.tertiary, 
                                marginTop: 8,
                                fontStyle: 'italic'
                            }}>
                                {format(start, 'MMM dd, yyyy')} - {format(end, 'MMM dd, yyyy')} ({daysDiff} {daysText})
                            </Text>
                        );
                    } catch (error) {
                        console.error('Error formatting custom date range:', error);
                        return null;
                    }
                })()}
            </View>

            {/* Dropdown Modal */}
            <Modal
                transparent
                visible={showDropdown}
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowDropdown(false)}
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
                >
                    <View style={{ 
                        backgroundColor: colors.background.card, 
                        borderRadius: 20, 
                        width: "100%", 
                        maxWidth: 400,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        elevation: 8,
                    }}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border.light }}>
                            <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: "700" }}>Select Time Period</Text>
                        </View>
                        <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                            {timeframeItems.map((option, index) => {
                                // Check if this option should be highlighted
                                const isSelected = isCustomDateRange 
                                    ? option.value === 'custom' 
                                    : selectedTimeframe === option.value;
                                
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => handleOptionSelect(option)}
                                        style={{
                                            paddingHorizontal: 20,
                                            paddingVertical: 16,
                                            borderBottomWidth: index < timeframeItems.length - 1 ? 1 : 0,
                                            borderBottomColor: colors.border.light,
                                            backgroundColor: isSelected ? colors.primary[50] : "transparent",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: isSelected
                                                    ? colors.primary[600] 
                                                    : colors.text.primary,
                                                fontWeight: isSelected ? "600" : "400",
                                            }}
                                        >
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <Check size={18} color={colors.primary[600]} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Custom Date Range Modal */}
            <Modal
                visible={showCustomModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCustomModal(false)}
            >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                        <TouchableOpacity activeOpacity={1} onPress={() => setShowCustomModal(false)} style={{ flex: 1 }} />
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
                                    padding: 24,
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
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>Custom Date Range</Text>
                                    <ModalCloseButton onPress={() => setShowCustomModal(false)} />
                                </View>

                        {/* Start Date */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 8 }}>Start Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowStartPicker(true)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.background.input,
                                    borderWidth: 1,
                                    borderColor: colors.border.medium,
                                    borderRadius: 12,
                                    padding: 16
                                }}
                            >
                                <Calendar size={20} color={colors.primary[600]} />
                                <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text.primary, fontWeight: '500' }}>
                                    {formatDate(startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* End Date */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 8 }}>End Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowEndPicker(true)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.background.input,
                                    borderWidth: 1,
                                    borderColor: colors.border.medium,
                                    borderRadius: 12,
                                    padding: 16
                                }}
                            >
                                <Calendar size={20} color={colors.primary[600]} />
                                <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text.primary, fontWeight: '500' }}>
                                    {formatDate(endDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Error Message */}
                        {dateError ? (
                            <View style={{
                                backgroundColor: colors.status.errorLight,
                                borderWidth: 1,
                                borderColor: colors.border.error,
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 16
                            }}>
                                <Text style={{ fontSize: 14, color: colors.status.error, fontWeight: '500' }}>{dateError}</Text>
                            </View>
                        ) : null}

                        {/* Info */}
                        <View style={{
                            backgroundColor: colors.status.infoLight,
                            borderWidth: 1,
                            borderColor: colors.border.medium,
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 24
                        }}>
                            <Text style={{ fontSize: 12, color: colors.status.info }}>
                                Select a date range between 1 day and 1 year
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowCustomModal(false)}
                                style={{ 
                                    flex: 1, 
                                    paddingVertical: 16, 
                                    borderRadius: 12, 
                                    borderWidth: 1, 
                                    borderColor: colors.border.medium,
                                    backgroundColor: colors.neutral[100] 
                                }}
                            >
                                <Text style={{ textAlign: 'center', color: colors.text.secondary, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleApplyCustomDates}
                                style={{ 
                                    flex: 1, 
                                    paddingVertical: 16, 
                                    borderRadius: 12,
                                    backgroundColor:  colors.primary[200] 
                                }}
                            >
                                <Text style={{ textAlign: 'center', color: colors.text.white, fontWeight: '600' }}>Apply</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Pickers */}
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowStartPicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setStartDate(selectedDate);
                                        setDateError('');
                                    }
                                }}
                                maximumDate={new Date()}
                                textColor={colors.text.primary}
                                accentColor={colors.primary[600]}
                            />
                        )}

                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowEndPicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setEndDate(selectedDate);
                                        setDateError('');
                                    }
                                }}
                                maximumDate={new Date()}
                                minimumDate={startDate}
                                textColor={colors.text.primary}
                                accentColor={colors.primary[600]}
                            />
                        )}
                            </Animated.View>
                        </GestureDetector>
                    </View>
                </GestureHandlerRootView>
            </Modal>
        </>
    );
}
