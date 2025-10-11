import React from "react";
import { View, Text, Dimensions } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { colors } from "../../constants/ui_colors";

const { width: screenWidth } = Dimensions.get('window');

export default function WeeklyProgress({ weeklyProgress }) {
    // Build pie data: completed vs missed days in the week
    const buildPieData = () => {
        if (!weeklyProgress || weeklyProgress.length === 0) return [];
        const completed = weeklyProgress.filter(d => d && d.completed).length;
        const missed = weeklyProgress.length - completed;
        const slices = [];
        if (completed > 0) slices.push({ value: completed, color: colors.status.success, text: String(completed), textColor: colors.text.white, textSize: 10, label: 'Completed' });
        if (missed > 0) slices.push({ value: missed, color: colors.neutral[300], text: String(missed), textColor: colors.text.white, textSize: 10, label: 'Missed' });
        return slices;
    };

    if (!weeklyProgress || weeklyProgress.length === 0) {
        return (
            <View className="bg-white rounded-xl p-6 items-center shadow-sm">
                <Text className="text-slate-600">No weekly progress data available</Text>
            </View>
        );
    }

    return (
        <View>
            <View className="bg-white rounded-xl p-6 shadow-sm">
                <View className="items-center justify-center" style={{ height: 160 }}>
                    <PieChart
                        data={buildPieData()}
                        radius={60}
                        innerRadius={32}
                        showText
                        textColor={colors.text.white}
                        textSize={10}
                        centerLabelComponent={() => (
                            <View className="items-center">
                                <Text className="text-lg font-bold" style={{ color: colors.neutral[900] }}>
                                    {weeklyProgress.filter(d => d && d.completed).length}/
                                    {weeklyProgress.length}
                                </Text>
                                <Text className="text-xs" style={{ color: colors.neutral[600] }}>Days</Text>
                            </View>
                        )}
                    />
                </View>
                <View className="flex-row justify-center mt-3">
                    {buildPieData().map((s, idx) => (
                        <View key={idx} className="flex-row items-center mx-3">
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color, marginRight: 6 }} />
                            <Text className="text-xs" style={{ color: colors.neutral[600] }}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
