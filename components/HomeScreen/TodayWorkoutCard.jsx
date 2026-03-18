import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Dumbbell, Plus, CheckCircle2 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatShortNumber } from "../../utils/numberUtils";

export default function TodayWorkoutCard({ recentSets, onLogExercise, onExercisePress }) {
    const colors = useThemedColors();

    const todayData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySets = (recentSets || []).filter(s => {
            const d = new Date(s.performed_at);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });

        if (todaySets.length === 0) return null;

        const exercises = new Set(todaySets.map(s => s.exercises?.name).filter(Boolean));
        const totalVolume = todaySets.reduce((sum, s) => {
            const weight = s.weight || 0;
            const reps = s.reps || 0;
            const sets = s.sets || 1;
            return sum + (weight * reps * sets);
        }, 0);
        const totalSets = todaySets.reduce((sum, s) => sum + (s.sets || 1), 0);

        return {
            exerciseNames: [...exercises],
            exerciseCount: exercises.size,
            totalVolume,
            totalSets,
        };
    }, [recentSets]);

    if (!todayData) {
        return (
            <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border.light,
                alignItems: "center",
            }}>
                <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: colors.primary[600] + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                }}>
                    <Dumbbell size={28} color={colors.primary[600]} />
                </View>
                <Text style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.text.primary,
                    marginBottom: 6,
                }}>
                    No workout yet today
                </Text>
                <Text style={{
                    fontSize: 14,
                    color: colors.text.tertiary,
                    textAlign: "center",
                    marginBottom: 20,
                    lineHeight: 20,
                }}>
                    Start logging exercises to track your progress
                </Text>
                <TouchableOpacity
                    onPress={onLogExercise}
                    activeOpacity={0.8}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.primary[600],
                        paddingHorizontal: 24,
                        paddingVertical: 14,
                        borderRadius: 14,
                        gap: 8,
                    }}
                >
                    <Plus size={20} color="#fff" />
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                        Log Exercise
                    </Text>
                </TouchableOpacity>
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: colors.status.success + "15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <CheckCircle2 size={20} color={colors.status.success} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        Today's Workout
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={onLogExercise}
                    activeOpacity={0.7}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.primary[600] + "15",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                        gap: 4,
                    }}
                >
                    <Plus size={16} color={colors.primary[600]} />
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary[600] }}>Add</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {todayData.exerciseCount}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 2 }}>
                        Exercises
                    </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {formatShortNumber(todayData.totalVolume)}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 2 }}>
                        Volume (kg)
                    </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {todayData.totalSets}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 2 }}>
                        Sets
                    </Text>
                </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {todayData.exerciseNames.slice(0, 6).map((name) => (
                    <TouchableOpacity
                        key={name}
                        activeOpacity={0.7}
                        onPress={() => onExercisePress?.(name)}
                        style={{
                            backgroundColor: colors.primary[600] + "12",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary[600] }}>
                            {name}
                        </Text>
                    </TouchableOpacity>
                ))}
                {todayData.exerciseNames.length > 6 && (
                    <View style={{
                        backgroundColor: colors.background.primary,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                    }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.tertiary }}>
                            +{todayData.exerciseNames.length - 6} more
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
