import React, { useMemo } from "react";
import { View, Text, Dimensions } from "react-native";
import { TrendingUp, BarChart2 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatShortNumber } from "../../utils/numberUtils";
import { LineChart } from "react-native-gifted-charts";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function VolumeTrendCard({ volumeProgression }) {
    const colors = useThemedColors();

    const { chartData, totalVolume, hasData } = useMemo(() => {
        if (!volumeProgression || volumeProgression.length === 0) {
            return { chartData: [], totalVolume: 0, hasData: false };
        }

        const total = volumeProgression.reduce((sum, d) => sum + (d.totalVolume || 0), 0);
        const count = volumeProgression.length;

        const data = volumeProgression.map((d, i) => {
            const date = new Date(d.date);
            const showLabel = count <= 10 || i % Math.ceil(count / 6) === 0 || i === count - 1;
            const label = showLabel
                ? date.toLocaleDateString("en", { month: "short", day: "numeric" })
                : "";
            return {
                value: d.totalVolume || 0,
                label,
                labelTextStyle: {
                    color: colors.text.tertiary,
                    fontSize: 9,
                    fontWeight: "500",
                },
            };
        });

        return { chartData: data, totalVolume: total, hasData: total > 0 };
    }, [volumeProgression, colors]);

    const chartWidth = SCREEN_WIDTH - 40 - 32 - 40;

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
                    <BarChart2 size={24} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.secondary, marginBottom: 4 }}>
                    No volume data yet
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center" }}>
                    Log workouts to see your volume trend
                </Text>
            </View>
        );
    }

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

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
                        <TrendingUp size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        Volume Trend
                    </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 }}>
                        {formatShortNumber(totalVolume)}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>kg total</Text>
                </View>
            </View>

            <View style={{ alignItems: "center", overflow: "hidden" }}>
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={140}
                    color={colors.primary[600]}
                    thickness={2.5}
                    dataPointsColor={colors.primary[600]}
                    dataPointsRadius={chartData.length > 15 ? 0 : 3}
                    hideDataPoints={chartData.length > 15}
                    hideRules={false}
                    rulesType="solid"
                    rulesColor={colors.border.light}
                    yAxisColor="transparent"
                    xAxisColor={colors.border.light}
                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: "500" }}
                    showVerticalLines={false}
                    showHorizontalLines={true}
                    spacing={Math.max((chartWidth - 40) / Math.max(chartData.length - 1, 1), 10)}
                    initialSpacing={16}
                    endSpacing={16}
                    maxValue={maxValue * 1.2}
                    noOfSections={4}
                    yAxisSide="left"
                    xAxisSide="bottom"
                    curved
                    areaChart
                    startFillColor={colors.primary[600] + "40"}
                    endFillColor={colors.primary[600] + "08"}
                    startOpacity={0.4}
                    endOpacity={0.05}
                    yAxisThickness={0}
                    xAxisThickness={1}
                    yAxisLabelWidth={36}
                    isAnimated={false}
                    scrollToEnd
                    pointerConfig={{
                        pointerStripColor: colors.primary[600],
                        pointerStripWidth: 1,
                        pointerColor: colors.primary[600],
                        radius: 4,
                        pointerLabelWidth: 80,
                        pointerLabelHeight: 28,
                        pointerLabelComponent: (items) => (
                            <View style={{
                                backgroundColor: colors.background.card,
                                borderRadius: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                            }}>
                                <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text.primary }}>
                                    {formatShortNumber(items[0].value)} kg
                                </Text>
                            </View>
                        ),
                    }}
                />
            </View>
        </View>
    );
}
