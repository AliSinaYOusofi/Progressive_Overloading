import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Activity } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatShortNumber } from "../../utils/numberUtils";

const MAX_GROUPS = 5;

const MUSCLE_COLORS = [
    "#6EE7B7", // emerald
    "#93C5FD", // blue
    "#FCD34D", // amber
    "#F9A8D4", // pink
    "#A5B4FC", // indigo
];

const formatName = (name) => {
    if (!name) return "";
    return name
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

export default function MuscleBalanceCard({ heatmapData }) {
    const colors = useThemedColors();

    const groups = useMemo(() => {
        if (!Array.isArray(heatmapData) || heatmapData.length === 0) return [];
        return heatmapData.slice(0, MAX_GROUPS);
    }, [heatmapData]);

    const maxVolume = useMemo(() => {
        if (groups.length === 0) return 0;
        return Math.max(...groups.map(g => g.volume));
    }, [groups]);

    if (groups.length === 0) {
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
                    backgroundColor: colors.status.info + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                }}>
                    <Activity size={24} color={colors.status.info} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.secondary, marginBottom: 4 }}>
                    No muscle data yet
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center" }}>
                    Log workouts to see your muscle group balance
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
                        backgroundColor: colors.status.info + "15",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Activity size={20} color={colors.status.info} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        Muscle Balance
                    </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.tertiary }}>
                    Last 30 days
                </Text>
            </View>

            <View style={{ gap: 12 }}>
                {groups.map((group, index) => {
                    const barWidth = maxVolume > 0
                        ? Math.max((group.volume / maxVolume) * 100, 8)
                        : 0;
                    const barColor = MUSCLE_COLORS[index % MUSCLE_COLORS.length];

                    return (
                        <View key={group.muscleGroup} style={{ gap: 6 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                    {formatName(group.muscleGroup)}
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text.secondary }}>
                                    {formatShortNumber(Math.round(group.volume))} kg
                                </Text>
                            </View>
                            <View style={{
                                height: 8,
                                backgroundColor: colors.background.primary,
                                borderRadius: 4,
                                overflow: "hidden",
                            }}>
                                <View style={{
                                    height: "100%",
                                    width: `${barWidth}%`,
                                    backgroundColor: barColor,
                                    borderRadius: 4,
                                }} />
                            </View>
                        </View>
                    );
                })}
            </View>

            {heatmapData && heatmapData.length > MAX_GROUPS && (
                <Text style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: colors.text.tertiary,
                    textAlign: "center",
                    marginTop: 12,
                }}>
                    +{heatmapData.length - MAX_GROUPS} more muscle groups
                </Text>
            )}
        </View>
    );
}
