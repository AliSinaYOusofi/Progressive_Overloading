import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Platform, ScrollView } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, X, ChevronDown, Check } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { colorScheme } from "nativewind";

export default function TimeframeFilter({ selectedTimeframe, onTimeframeChange, onCustomDateRange }) {
    const colors = useThemedColors();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [dateError, setDateError] = useState('');

    const timeframeItems = [
        { label: "7 Days", value: 7 },
        { label: "1 Month", value: 30 },
        { label: "3 Months", value: 90 },
        { label: "6 Months", value: 180 },
        { label: "All Time", value: 'all' },
        { label: "Custom", value: 'custom' }
    ];

    const getSelectedLabel = () => {
        const option = timeframeItems.find(opt => opt.value === selectedTimeframe);
        return option ? option.label : "Select time period";
    };

    const handleOptionSelect = (option) => {
        if (option.value === 'custom') {
            setShowDropdown(false);
            setShowCustomModal(true);
        } else {
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
                            {timeframeItems.map((option, index) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleOptionSelect(option)}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 16,
                                        borderBottomWidth: index < timeframeItems.length - 1 ? 1 : 0,
                                        borderBottomColor: colors.border.light,
                                        backgroundColor: selectedTimeframe === option.value ? colors.primary[50] : "transparent",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: selectedTimeframe === option.value 
                                                ? colors.primary[600] 
                                                : colors.text.primary,
                                            fontWeight: selectedTimeframe === option.value ? "600" : "400",
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                    {selectedTimeframe === option.value && (
                                        <Check size={18} color={colors.primary[600]} />
                                    )}
                                </TouchableOpacity>
                            ))}
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
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ 
                        backgroundColor: colors.background.card, 
                        borderTopLeftRadius: 24, 
                        borderTopRightRadius: 24, 
                        padding: 24, 
                        maxHeight: '80%' 
                    }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>Custom Date Range</Text>
                            <TouchableOpacity
                                onPress={() => setShowCustomModal(false)}
                                style={{ 
                                    width: 32, 
                                    height: 32, 
                                    borderRadius: 16, 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: colors.neutral[100] 
                                }}
                            >
                                <X size={20} color={colors.neutral[600]} />
                            </TouchableOpacity>
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
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}
