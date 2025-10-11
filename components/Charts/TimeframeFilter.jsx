import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, X } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";

export default function TimeframeFilter({ selectedTimeframe, onTimeframeChange, onCustomDateRange }) {
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [dateError, setDateError] = useState('');

    const getTimeframeOptions = () => [
        { label: "7 Days", value: 7 },
        { label: "1 Month", value: 30 },
        { label: "3 Months", value: 90 },
        { label: "6 Months", value: 180 },
        { label: "All Time", value: 'all' },
        { label: "Custom", value: 'custom' }
    ];

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

    const handleOptionPress = (option) => {
        if (option.value === 'custom') {
            setShowCustomModal(true);
        } else {
            onTimeframeChange(option.value);
        }
    };

    return (
        <>
            <View className="mb-6">
                <Text className="text-base font-semibold text-slate-900 mb-3">Time Period:</Text>
                <View className="flex-row flex-wrap gap-2">
                    {getTimeframeOptions().map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`px-4 py-2 rounded-full border ${
                                selectedTimeframe === option.value 
                                    ? 'bg-emerald-600 border-emerald-600' 
                                    : 'bg-white border-gray-200'
                            }`}
                            onPress={() => handleOptionPress(option)}
                        >
                            <Text className={`text-sm font-medium ${
                                selectedTimeframe === option.value 
                                    ? 'text-white' 
                                    : 'text-slate-700'
                            }`}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Custom Date Range Modal */}
            <Modal
                visible={showCustomModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCustomModal(false)}
            >
                <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-slate-900">Custom Date Range</Text>
                            <TouchableOpacity
                                onPress={() => setShowCustomModal(false)}
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: colors.neutral[100] }}
                            >
                                <X size={20} color={colors.neutral[600]} />
                            </TouchableOpacity>
                        </View>

                        {/* Start Date */}
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-slate-700 mb-2">Start Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowStartPicker(true)}
                                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl p-4"
                            >
                                <Calendar size={20} color={colors.primary[600]} />
                                <Text className="ml-3 text-base text-slate-900 font-medium">
                                    {formatDate(startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* End Date */}
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-slate-700 mb-2">End Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowEndPicker(true)}
                                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl p-4"
                            >
                                <Calendar size={20} color={colors.primary[600]} />
                                <Text className="ml-3 text-base text-slate-900 font-medium">
                                    {formatDate(endDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Error Message */}
                        {dateError ? (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                <Text className="text-sm text-red-600 font-medium">{dateError}</Text>
                            </View>
                        ) : null}

                        {/* Info */}
                        <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
                            <Text className="text-xs text-blue-700">
                                Select a date range between 1 day and 1 year
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowCustomModal(false)}
                                className="flex-1 py-4 rounded-xl border border-slate-200"
                                style={{ backgroundColor: colors.neutral[100] }}
                            >
                                <Text className="text-center text-slate-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleApplyCustomDates}
                                className="flex-1 py-4 rounded-xl"
                                style={{ backgroundColor: colors.primary[600] }}
                            >
                                <Text className="text-center text-white font-semibold">Apply</Text>
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
