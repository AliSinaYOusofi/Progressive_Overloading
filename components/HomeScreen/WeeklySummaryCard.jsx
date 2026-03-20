import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Award, Crown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatShortNumber } from "../../utils/numberUtils";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WeeklySummaryCard({ recentSets }) {
    const colors = useThemedColors();

    const weeklyData = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weekSets = (recentSets || []).filter(s => {
            if (!s.performed_at) return false;
            const d = new Date(s.performed_at);
            return d >= startOfWeek && d <= endOfWeek;
        });

        if (weekSets.length === 0) return null;

        const dayMap = {};
        const allExercises = new Set();

        weekSets.forEach(s => {
            const dayIndex = new Date(s.performed_at).getDay();
            if (!dayMap[dayIndex]) {
                dayMap[dayIndex] = { volume: 0, exercises: new Set() };
            }
            const volume = (s.weight || 0) * (s.reps || 0) * (s.sets || 1);
            dayMap[dayIndex].volume += volume;
            const name = s.exercises?.name;
            if (name) {
                dayMap[dayIndex].exercises.add(name);
                allExercises.add(name);
            }
        });

        let bestDayIndex = null;
        let bestDayVolume = -1;
        Object.entries(dayMap).forEach(([dayIdx, data]) => {
            if (data.volume > bestDayVolume) {
                bestDayVolume = data.volume;
                bestDayIndex = Number(dayIdx);
            }
        });

        return {
            bestDayName: DAY_NAMES[bestDayIndex],
            bestDayVolume,
            bestDayExerciseCount: dayMap[bestDayIndex].exercises.size,
            totalWeekVolume: Object.values(dayMap).reduce((sum, d) => sum + d.volume, 0),
            workoutDayCount: Object.keys(dayMap).length,
        };
    }, [recentSets]);

    if (!weeklyData) {
        return (
            <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                paddingVertical: 32,
                borderWidth: 1,
                borderColor: colors.border.light,
                alignItems: "center",
            }}>
                <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: colors.status.warning + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                }}>
                    <Award size={24} color={colors.status.warning} />
                </View>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text.secondary,
                    marginBottom: 4,
                }}>
                    No workouts this week
                </Text>
                <Text style={{
                    fontSize: 13,
                    color: colors.text.tertiary,
                    textAlign: "center",
                    lineHeight: 18,
                }}>
                    Log exercises to see your best day of the week
                </Text>
            </View>
        );
    }

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
        }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: colors.status.warning + "15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Award size={20} color={colors.status.warning} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        Best Day This Week
                    </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.tertiary }}>
                    {weeklyData.workoutDayCount}/7 days
                </Text>
            </View>

            {/* Hero: Best Day */}
            <View style={{
                backgroundColor: colors.status.warning + "08",
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.status.warning + "15",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Crown size={20} color={colors.status.warning} />
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {weeklyData.bestDayName}
                    </Text>
                </View>
                <View style={{
                    backgroundColor: colors.status.warning + "15",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: colors.status.warning }}>
                        Top Volume
                    </Text>
                </View>
            </View>

            {/* 3-stat row */}
            <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {formatShortNumber(weeklyData.bestDayVolume)}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 2 }}>
                        Best Day Vol
                    </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {formatShortNumber(weeklyData.totalWeekVolume)}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 2 }}>
                        Week Total
                    </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {weeklyData.bestDayExerciseCount}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 2 }}>
                        Exercises
                    </Text>
                </View>
            </View>
        </View>
    );
}
