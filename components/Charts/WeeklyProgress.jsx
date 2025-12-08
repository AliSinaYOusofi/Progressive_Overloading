import React from "react";
import { View, Text, Dimensions } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useThemedColors } from "../../hooks/useThemedColors";

const { width: screenWidth } = Dimensions.get('window');

export default function WeeklyProgress({ weeklyProgress }) {
    const colors = useThemedColors();
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
            <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2
            }}>
                <Text style={{ color: colors.text.secondary }}>No weekly progress data available</Text>
            </View>
        );
    }

    return (
        <View>
            <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 12,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2
            }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 160 }}>
                    <PieChart
                        data={buildPieData()}
                        radius={60}
                        innerRadius={32}
                        innerCircleColor={colors.background.card}
                        showText
                        textColor={colors.text.white}
                        textSize={10}
                        centerLabelComponent={() => (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                                    {weeklyProgress.filter(d => d && d.completed).length}/
                                    {weeklyProgress.length}
                                </Text>
                                <Text style={{ fontSize: 12, color: colors.text.secondary }}>Days</Text>
                            </View>
                        )}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                    {buildPieData().map((s, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color, marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: colors.text.secondary }}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
