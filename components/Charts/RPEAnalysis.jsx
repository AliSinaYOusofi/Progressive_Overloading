import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useThemedColors } from "../../hooks/useThemedColors";

const { width: screenWidth } = Dimensions.get('window');

export default function RPEAnalysis({ rpeAnalysis }) {
    const colors = useThemedColors();
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
            <View style={{ gap: 12 }}>
                {rpeAnalysis.slice(0, 4).map((exercise, index) => {
                    if (!exercise || !exercise.exercise) return null;
                    return (
                        <View 
                            key={index} 
                            style={{
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                                padding: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 2
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, flex: 1 }}>{exercise.exercise}</Text>
                                <View 
                                    style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 12,
                                        backgroundColor: getIntensityColor(exercise.intensity)
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.white }}>
                                        {(exercise.intensity || 'low').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary }}>
                                    Avg RPE: {(exercise.avgRPE || 0).toFixed(1)}/10
                                </Text>
                                <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                                    {exercise.totalSets || 0} sets logged
                                </Text>
                            </View>
                            
                            {/* RPE Trend Visualization */}
                            {exercise.rpeTrend && exercise.rpeTrend.length > 1 && (
                            <View style={{ height: 96, marginBottom: 8 }}>
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
                                    rulesColor={colors.border.light}
                                    yAxisColor={colors.border.light}
                                    xAxisColor={colors.border.light}
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
