import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatShortNumber } from "../../utils/numberUtils";

function getWeekBounds(weeksAgo = 0) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() - weeksAgo * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function computeWeekStats(sets) {
    const volume = sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0);
    const totalSets = sets.reduce((sum, s) => sum + (s.sets || 1), 0);
    const exercises = new Set(sets.map(s => s.exercises?.name).filter(Boolean));
    return { volume, sets: totalSets, exercises: exercises.size };
}

function calcChange(current, previous) {
    if (previous === 0 && current === 0) return { percentage: 0, direction: "same" };
    if (previous === 0) return { percentage: 100, direction: "up" };
    const pct = Math.round(((current - previous) / previous) * 100);
    return {
        percentage: Math.abs(pct),
        direction: pct > 0 ? "up" : pct < 0 ? "down" : "same",
    };
}

function ChangeBadge({ change, colors }) {
    const isUp = change.direction === "up";
    const isDown = change.direction === "down";
    const color = isUp ? colors.status.success : isDown ? colors.status.error : colors.text.tertiary;
    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: color + "15",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            gap: 3,
        }}>
            <Icon size={12} color={color} />
            <Text style={{ fontSize: 12, fontWeight: "700", color }}>
                {change.direction === "same" ? "0%" : `${change.percentage}%`}
            </Text>
        </View>
    );
}

function ComparisonRow({ label, thisWeek, lastWeek, change, colors, formatValue }) {
    const displayThis = formatValue ? formatShortNumber(thisWeek) : thisWeek;
    const displayLast = formatValue ? formatShortNumber(lastWeek) : lastWeek;

    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            padding: 14,
        }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.secondary, width: 80 }}>
                {label}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.3 }}>
                    {displayThis}
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary }}>vs</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.tertiary }}>
                    {displayLast}
                </Text>
            </View>
            <ChangeBadge change={change} colors={colors} />
        </View>
    );
}

export default function VolumeComparisonCard({ recentSets }) {
    const colors = useThemedColors();

    const comparisonData = useMemo(() => {
        const thisWeekBounds = getWeekBounds(0);
        const lastWeekBounds = getWeekBounds(1);

        const filterSets = (start, end) =>
            (recentSets || []).filter(s => {
                if (!s.performed_at) return false;
                const d = new Date(s.performed_at);
                return d >= start && d <= end;
            });

        const thisWeekSets = filterSets(thisWeekBounds.start, thisWeekBounds.end);
        const lastWeekSets = filterSets(lastWeekBounds.start, lastWeekBounds.end);

        if (thisWeekSets.length === 0 && lastWeekSets.length === 0) return null;

        const thisWeek = computeWeekStats(thisWeekSets);
        const lastWeek = computeWeekStats(lastWeekSets);

        return {
            thisWeek,
            lastWeek,
            changes: {
                volume: calcChange(thisWeek.volume, lastWeek.volume),
                sets: calcChange(thisWeek.sets, lastWeek.sets),
                exercises: calcChange(thisWeek.exercises, lastWeek.exercises),
            },
        };
    }, [recentSets]);

    if (!comparisonData) {
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
                    backgroundColor: colors.primary[600] + "15",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                }}>
                    <ArrowLeftRight size={24} color={colors.primary[600]} />
                </View>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text.secondary,
                    marginBottom: 4,
                }}>
                    No comparison data
                </Text>
                <Text style={{
                    fontSize: 13,
                    color: colors.text.tertiary,
                    textAlign: "center",
                    lineHeight: 18,
                }}>
                    Log workouts for two weeks to compare your progress
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
                        <ArrowLeftRight size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        vs Last Week
                    </Text>
                </View>
                <ChangeBadge change={comparisonData.changes.volume} colors={colors} />
            </View>

            <View style={{ gap: 8 }}>
                <ComparisonRow
                    label="Volume"
                    thisWeek={comparisonData.thisWeek.volume}
                    lastWeek={comparisonData.lastWeek.volume}
                    change={comparisonData.changes.volume}
                    colors={colors}
                    formatValue
                />
                <ComparisonRow
                    label="Sets"
                    thisWeek={comparisonData.thisWeek.sets}
                    lastWeek={comparisonData.lastWeek.sets}
                    change={comparisonData.changes.sets}
                    colors={colors}
                />
                <ComparisonRow
                    label="Exercises"
                    thisWeek={comparisonData.thisWeek.exercises}
                    lastWeek={comparisonData.lastWeek.exercises}
                    change={comparisonData.changes.exercises}
                    colors={colors}
                />
            </View>
        </View>
    );
}
