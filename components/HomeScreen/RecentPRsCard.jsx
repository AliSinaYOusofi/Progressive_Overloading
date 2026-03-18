import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Trophy, TrendingUp } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

const MAX_VISIBLE = 5;

export default function RecentPRsCard({ progressByExercise }) {
    const colors = useThemedColors();

    const topPRs = useMemo(() => {
        if (!progressByExercise || progressByExercise.length === 0) return [];

        return [...progressByExercise]
            .filter(p => p.best1RM > 0)
            .sort((a, b) => {
                if ((b.delta || 0) !== (a.delta || 0)) return (b.delta || 0) - (a.delta || 0);
                return (b.best1RM || 0) - (a.best1RM || 0);
            })
            .slice(0, MAX_VISIBLE);
    }, [progressByExercise]);

    if (topPRs.length === 0) {
        return (
            <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border.light,
                alignItems: "center",
                paddingVertical: 32,
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
                    <Trophy size={24} color={colors.status.warning} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.secondary, marginBottom: 4 }}>
                    No PRs yet
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center" }}>
                    Log exercises to start tracking your personal records
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.status.warning + "15",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Trophy size={20} color={colors.status.warning} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                    Top Exercises
                </Text>
            </View>

            <View style={{ gap: 2 }}>
                {topPRs.map((pr, index) => {
                    const hasDelta = pr.delta && pr.delta > 0;

                    return (
                        <View
                            key={pr.exerciseName || index}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: 12,
                                borderBottomWidth: index < topPRs.length - 1 ? 1 : 0,
                                borderBottomColor: colors.border.light,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <View style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    backgroundColor: colors.background.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 12,
                                }}>
                                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text.tertiary }}>
                                        {index + 1}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text.primary, flex: 1 }} numberOfLines={1}>
                                    {pr.exerciseName}
                                </Text>
                            </View>

                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                {hasDelta && (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: colors.status.success + "15",
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 8,
                                        gap: 3,
                                    }}>
                                        <TrendingUp size={12} color={colors.status.success} />
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.status.success }}>
                                            +{Math.round(pr.delta)}
                                        </Text>
                                    </View>
                                )}
                                <View style={{ alignItems: "flex-end" }}>
                                    <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.3 }}>
                                        {Math.round(pr.best1RM)}
                                    </Text>
                                    <Text style={{ fontSize: 10, fontWeight: "500", color: colors.text.tertiary }}>
                                        1RM
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
