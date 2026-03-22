import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Zap } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { useThemedColors } from "../../hooks/useThemedColors";

const RING_SIZE = 80;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ConsistencyRingCard({ recentSets, currentStreak }) {
    const colors = useThemedColors();

    const { workoutDays30, percentage, weeklyAvg } = useMemo(() => {
        const uniqueDates = new Set(
            (recentSets || []).filter(s => s.performed_at).map(s => {
                const d = new Date(s.performed_at);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            })
        );

        const days = uniqueDates.size;
        const pct = Math.round((days / 30) * 100);
        const weekly = Math.round((days / 30) * 7 * 10) / 10;

        return { workoutDays30: days, percentage: pct, weeklyAvg: weekly };
    }, [recentSets]);

    const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * Math.min(percentage, 100)) / 100;

    const getScoreLabel = (pct) => {
        if (pct >= 80) return "Excellent";
        if (pct >= 60) return "Great";
        if (pct >= 40) return "Good";
        if (pct >= 20) return "Building";
        return "Getting Started";
    };

    const getScoreColor = (pct) => {
        if (pct >= 60) return colors.status.success;
        if (pct >= 30) return colors.status.warning;
        return colors.status.error;
    };

    const ringColor = getScoreColor(percentage);

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
        }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.status.warning + "15",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Zap size={20} color={colors.status.warning} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                    Consistency
                </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Svg width={RING_SIZE} height={RING_SIZE}>
                        <Circle
                            cx={RING_SIZE / 2}
                            cy={RING_SIZE / 2}
                            r={RADIUS}
                            stroke={colors.background.primary}
                            strokeWidth={STROKE_WIDTH}
                            fill="none"
                        />
                        <Circle
                            cx={RING_SIZE / 2}
                            cy={RING_SIZE / 2}
                            r={RADIUS}
                            stroke={ringColor}
                            strokeWidth={STROKE_WIDTH}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={strokeDashoffset}
                            rotation="-90"
                            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                        />
                    </Svg>
                    <View style={{
                        position: "absolute",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: "800",
                            color: colors.text.primary,
                            letterSpacing: -0.5,
                        }}>
                            {percentage}%
                        </Text>
                    </View>
                </View>

                <View style={{ flex: 1, gap: 8 }}>
                    <View style={{
                        backgroundColor: ringColor + "15",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                    }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: ringColor }}>
                            {getScoreLabel(percentage)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 16 }}>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                                {workoutDays30}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                                days / 30
                            </Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                                {weeklyAvg}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                                avg / week
                            </Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                                {currentStreak || 0}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                                streak
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
