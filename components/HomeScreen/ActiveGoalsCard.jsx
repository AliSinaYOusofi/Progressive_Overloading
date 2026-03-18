import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Target, Plus, ChevronRight } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

const MAX_VISIBLE = 3;

export default function ActiveGoalsCard({ fitnessGoals, onGoalPress, onAddGoal }) {
    const colors = useThemedColors();

    const activeGoals = useMemo(() => {
        const now = new Date();
        return (fitnessGoals || []).filter(g =>
            !g.is_completed && new Date(g.target_date) >= now
        );
    }, [fitnessGoals]);

    const visibleGoals = activeGoals.slice(0, MAX_VISIBLE);
    const hasMore = activeGoals.length > MAX_VISIBLE;

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
                        backgroundColor: colors.primary[600] + "15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Target size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        Active Goals
                    </Text>
                    {activeGoals.length > 0 && (
                        <View style={{
                            backgroundColor: colors.primary[600] + "20",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                        }}>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary[600] }}>
                                {activeGoals.length}
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    onPress={onAddGoal}
                    activeOpacity={0.7}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: colors.primary[600] + "15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Plus size={18} color={colors.primary[600]} />
                </TouchableOpacity>
            </View>

            {activeGoals.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 16 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text.secondary, marginBottom: 4 }}>
                        No active goals
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center" }}>
                        Set a fitness goal to stay motivated
                    </Text>
                </View>
            ) : (
                <View style={{ gap: 12 }}>
                    {visibleGoals.map((goal) => {
                        const progress = goal.target_value > 0
                            ? Math.min((goal.current_value / goal.target_value) * 100, 100)
                            : 0;

                        return (
                            <TouchableOpacity
                                key={goal.id}
                                onPress={() => onGoalPress?.(goal)}
                                activeOpacity={0.7}
                                style={{
                                    backgroundColor: colors.background.primary,
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text.primary, flex: 1 }} numberOfLines={1}>
                                        {goal.title}
                                    </Text>
                                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary[600], marginLeft: 8 }}>
                                        {Math.round(progress)}%
                                    </Text>
                                </View>
                                <View style={{
                                    height: 6,
                                    backgroundColor: colors.border.light,
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    marginBottom: 6,
                                }}>
                                    <View style={{
                                        height: "100%",
                                        width: `${progress}%`,
                                        backgroundColor: colors.primary[600],
                                        borderRadius: 3,
                                    }} />
                                </View>
                                <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                                    {goal.current_value} / {goal.target_value} {goal.unit || ""}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {hasMore && (
                        <TouchableOpacity
                            onPress={onAddGoal}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 8,
                                gap: 4,
                            }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary[600] }}>
                                View all {activeGoals.length} goals
                            </Text>
                            <ChevronRight size={16} color={colors.primary[600]} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}
