import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { CalendarCheck, Clock, Repeat, Star, Calendar } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WorkoutFrequencyCard({ recentSets }) {
    const colors = useThemedColors();

    const frequencyData = useMemo(() => {
        const sets = (recentSets || []).filter(s => s.performed_at);
        if (sets.length === 0) return null;

        // Get unique workout dates
        const dateMap = new Map();
        sets.forEach(s => {
            const d = new Date(s.performed_at);
            d.setHours(0, 0, 0, 0);
            const key = d.getTime();
            if (!dateMap.has(key)) dateMap.set(key, d);
        });

        const allDates = [...dateMap.values()].sort((a, b) => a - b);
        if (allDates.length === 0) return null;

        // Days since last workout
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const lastWorkout = allDates[allDates.length - 1];
        const daysSinceLast = Math.floor((now - lastWorkout) / (1000 * 60 * 60 * 24));

        // Average days between sessions
        let avgDaysBetween = 0;
        if (allDates.length > 1) {
            const totalDaySpan = (allDates[allDates.length - 1] - allDates[0]) / (1000 * 60 * 60 * 24);
            avgDaysBetween = Math.round((totalDaySpan / (allDates.length - 1)) * 10) / 10;
        }

        // Workouts per week
        const totalDaySpan = (now - allDates[0]) / (1000 * 60 * 60 * 24);
        const weeksSpan = Math.max(totalDaySpan / 7, 1);
        const workoutsPerWeek = Math.round((allDates.length / weeksSpan) * 10) / 10;

        // Favorite training day
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        allDates.forEach(d => dayCounts[d.getDay()]++);
        const maxCount = Math.max(...dayCounts);
        const favoriteDayIndex = dayCounts.indexOf(maxCount);
        const favoriteDayName = DAY_NAMES[favoriteDayIndex];

        // This week's activity dots
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeekDates = new Set();
        allDates.forEach(d => {
            if (d >= startOfWeek && d <= now) {
                thisWeekDates.add(d.getDay());
            }
        });
        const thisWeekDots = DAY_LABELS.map((_, i) => thisWeekDates.has(i));

        return {
            daysSinceLast,
            avgDaysBetween,
            workoutsPerWeek,
            favoriteDayName,
            thisWeekDots,
            totalWorkoutDays: allDates.length,
        };
    }, [recentSets]);

    if (!frequencyData) {
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
                    backgroundColor: colors.status.info + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                }}>
                    <CalendarCheck size={24} color={colors.status.info} />
                </View>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text.secondary,
                    marginBottom: 4,
                }}>
                    No workouts yet
                </Text>
                <Text style={{
                    fontSize: 13,
                    color: colors.text.tertiary,
                    textAlign: "center",
                    lineHeight: 18,
                }}>
                    Start logging to track your workout frequency
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
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: colors.status.info + "15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <CalendarCheck size={20} color={colors.status.info} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        Workout Frequency
                    </Text>
                </View>
                <View style={{
                    backgroundColor: colors.status.info + "15",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.status.info }}>
                        {frequencyData.workoutsPerWeek}/wk
                    </Text>
                </View>
            </View>

            {/* Day dots row */}
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 18,
                paddingHorizontal: 4,
            }}>
                {DAY_LABELS.map((label, i) => {
                    const isActive = frequencyData.thisWeekDots[i];
                    const isToday = i === new Date().getDay();
                    return (
                        <View key={i} style={{ alignItems: "center", gap: 6 }}>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: isToday ? colors.status.info : colors.text.tertiary,
                            }}>
                                {label}
                            </Text>
                            <View style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: isActive ? colors.status.success : colors.background.primary,
                                borderWidth: isActive ? 0 : 1,
                                borderColor: colors.border.light,
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                {isActive && (
                                    <View style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: "#fff",
                                    }} />
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* 2x2 stat grid */}
            <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <Clock size={13} color={colors.text.tertiary} />
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                                Last Workout
                            </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                            {frequencyData.daysSinceLast === 0 ? "Today" : `${frequencyData.daysSinceLast}d ago`}
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <Repeat size={13} color={colors.text.tertiary} />
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                                Avg Gap
                            </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                            {frequencyData.avgDaysBetween === 0 ? "-" : `${frequencyData.avgDaysBetween}d`}
                        </Text>
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <Calendar size={13} color={colors.text.tertiary} />
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                                Per Week
                            </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                            {frequencyData.workoutsPerWeek}
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <Star size={13} color={colors.text.tertiary} />
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                                Favorite Day
                            </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }} numberOfLines={1}>
                            {frequencyData.favoriteDayName}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
