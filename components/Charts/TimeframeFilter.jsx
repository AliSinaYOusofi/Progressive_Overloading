import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function TimeframeFilter({ selectedTimeframe, onTimeframeChange }) {
    const getTimeframeOptions = () => [
        { label: "7 Days", value: 7 },
        { label: "30 Days", value: 30 },
        { label: "90 Days", value: 90 },
        { label: "6 Months", value: 180 }
    ];

    return (
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
                        onPress={() => onTimeframeChange(option.value)}
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
    );
}
