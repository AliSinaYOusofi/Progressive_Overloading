import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { colors } from "../../constants/ui_colors";

const { width: screenWidth } = Dimensions.get('window');

export default function RPEAnalysis({ rpeAnalysis }) {
    if (!rpeAnalysis || rpeAnalysis.length === 0) {
        return null;
    }

    const getIntensityColor = (intensity) => {
        switch (intensity) {
            case 'high': return colors.status.error;
            case 'moderate': return colors.status.warning;
            case 'low': return colors.status.success;
            default: return colors.text.tertiary;
        }
    };

    // Helper function to format RPE data for LineChart
    const formatRPEDataForChart = (rpeData) => {
        if (!rpeData || rpeData.length === 0) return [];
        
        return rpeData
            .slice(-7)
            .filter(point => point && point.date && point.rpe !== undefined)
            .map((point, index) => ({
                value: point.rpe,
                label: index % 2 === 0 ? new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '',
                dataPointText: point.rpe.toFixed(1),
                labelTextStyle: { color: colors.text.tertiary, fontSize: 8 },
                dataPointTextStyle: { color: colors.text.primary, fontSize: 8 }
            }));
    };

    return (
        <View>
            <View className="gap-3">
                {rpeAnalysis.slice(0, 4).map((exercise, index) => {
                    if (!exercise || !exercise.exercise) return null;
                    return (
                        <View key={index} className="bg-white rounded-xl p-4 shadow-sm">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-base font-semibold text-slate-900 flex-1">{exercise.exercise}</Text>
                                <View 
                                    className="px-2 py-1 rounded-xl"
                                    style={{ backgroundColor: getIntensityColor(exercise.intensity) }}
                                >
                                    <Text className="text-xs font-semibold text-white">
                                        {(exercise.intensity || 'low').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-sm font-semibold text-slate-700">
                                    Avg RPE: {(exercise.avgRPE || 0).toFixed(1)}/10
                                </Text>
                                <Text className="text-xs text-slate-600">
                                    {exercise.totalSets || 0} sets logged
                                </Text>
                            </View>
                            
                            {/* RPE Trend Visualization */}
                            {exercise.rpeTrend && exercise.rpeTrend.length > 1 && (
                            <View className="h-24 mb-2">
                                <LineChart
                                    data={formatRPEDataForChart(exercise.rpeTrend)}
                                    width={screenWidth - 100}
                                    height={90}
                                    color={getIntensityColor(exercise.intensity)}
                                    thickness={2}
                                    dataPointsColor={getIntensityColor(exercise.intensity)}
                                    dataPointsRadius={3}
                                    hideDataPoints={false}
                                    hideRules={false}
                                    rulesType="solid"
                                    rulesColor={colors.neutral[200]}
                                    yAxisColor={colors.neutral[200]}
                                    xAxisColor={colors.neutral[200]}
                                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 8 }}
                                    xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 8 }}
                                    showVerticalLines={false}
                                    showHorizontalLines={true}
                                    spacing={18}
                                    initialSpacing={8}
                                    endSpacing={8}
                                    maxValue={10}
                                    noOfSections={5}
                                    yAxisSide="left"
                                    xAxisSide="bottom"
                                />
                            </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
