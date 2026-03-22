import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { TrendingUp, TrendingDown, AlertTriangle, Zap } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

const MAX_ITEMS = 2;

export default function OverloadSpotlightCard({ overloadInsights }) {
    const colors = useThemedColors();

    const { improving, plateaued } = useMemo(() => {
        if (!Array.isArray(overloadInsights) || overloadInsights.length === 0) {
            return { improving: [], plateaued: [] };
        }

        const imp = overloadInsights
            .filter(e => e.progression === "excellent" || e.progression === "good")
            .sort((a, b) => (b.weeklyGain || 0) - (a.weeklyGain || 0))
            .slice(0, MAX_ITEMS);

        const plt = overloadInsights
            .filter(e => e.isPlateaued)
            .sort((a, b) => (b.plateauDuration || 0) - (a.plateauDuration || 0))
            .slice(0, MAX_ITEMS);

        return { improving: imp, plateaued: plt };
    }, [overloadInsights]);

    const hasData = improving.length > 0 || plateaued.length > 0;

    if (!hasData) {
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
                    backgroundColor: colors.primary[600] + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                }}>
                    <Zap size={24} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.secondary, marginBottom: 4 }}>
                    No overload data yet
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center", lineHeight: 18 }}>
                    Log exercises consistently to track progressive overload
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
                        backgroundColor: colors.primary[600] + "15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Zap size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        Overload Spotlight
                    </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.tertiary }}>
                    Last 30 days
                </Text>
            </View>

            {improving.length > 0 && (
                <View style={{ marginBottom: plateaued.length > 0 ? 14 : 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <TrendingUp size={14} color={colors.status.success} />
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.status.success }}>
                            Progressing
                        </Text>
                    </View>
                    <View style={{ gap: 8 }}>
                        {improving.map((ex) => (
                            <View
                                key={ex.exercise}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backgroundColor: colors.status.success + "08",
                                    borderRadius: 12,
                                    padding: 12,
                                    borderWidth: 1,
                                    borderColor: colors.status.success + "15",
                                }}
                            >
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text.primary }} numberOfLines={1}>
                                        {ex.exercise}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
                                        {ex.workoutCount || 0} workouts
                                    </Text>
                                </View>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: colors.status.success + "15",
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 10,
                                    gap: 4,
                                }}>
                                    <TrendingUp size={14} color={colors.status.success} />
                                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.status.success }}>
                                        +{(ex.totalGain || 0).toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {plateaued.length > 0 && (
                <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <AlertTriangle size={14} color={colors.status.warning} />
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.status.warning }}>
                            Plateaued
                        </Text>
                    </View>
                    <View style={{ gap: 8 }}>
                        {plateaued.map((ex) => {
                            const weeksPlateaued = Math.floor((ex.plateauDuration || 0) / 7);
                            return (
                                <View
                                    key={ex.exercise}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: colors.status.warning + "08",
                                        borderRadius: 12,
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: colors.status.warning + "15",
                                    }}
                                >
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text.primary }} numberOfLines={1}>
                                            {ex.exercise}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }} numberOfLines={1}>
                                            {ex.plateauReason || "Progress stalled"}
                                        </Text>
                                    </View>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: colors.status.warning + "15",
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                        borderRadius: 10,
                                        gap: 4,
                                    }}>
                                        <AlertTriangle size={13} color={colors.status.warning} />
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.status.warning }}>
                                            {weeksPlateaued > 0 ? `${weeksPlateaued}w` : "<1w"}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}
