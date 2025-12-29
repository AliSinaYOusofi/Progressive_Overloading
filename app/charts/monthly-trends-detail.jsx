import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { getCurrentUser, getMonthlyDetailData } from "../../lib/database";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Activity, Dumbbell, Repeat, Calendar, TrendingUp, TrendingDown, Trophy, BarChart3, Target } from "lucide-react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "../../contexts/ThemeContext";

const { width: screenWidth } = Dimensions.get('window');

export default function MonthlyTrendsDetailScreen() {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const month = params.month || '';

    const [monthlyData, setMonthlyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useLayoutEffect(() => {
        if (month) {
            const [year, monthNum] = month.split('-').map(Number);
            const date = new Date(year, monthNum - 1, 1);
            const monthName = date.toLocaleDateString("en", { month: "long", year: "numeric" });
            navigation.setOptions({ title: monthName });
        }
    }, [month, navigation]);

    useEffect(() => {
        loadData();
    }, [month]);

    const loadData = async (isRefresh = false) => {
        try {
            if (!isRefresh) setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            if (!currentUser || !month) return;

            const data = await getMonthlyDetailData(currentUser.id, month);
            setMonthlyData(data);
        } catch (error) {
            console.error("Error loading monthly detail data:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    const formatVolume = (volume) => {
        if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(1)}M`;
        }
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}k`;
        }
        return volume.toFixed(0);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en", { 
            month: "short", 
            day: "numeric",
            year: "numeric"
        });
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading monthly breakdown...</Text>
            </View>
        );
    }

    if (!monthlyData || !monthlyData.summary) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <Text style={{ fontSize: 16, color: colors.text.secondary }}>No data available for this month</Text>
            </View>
        );
    }

    const { summary, dailyBreakdown, exerciseBreakdown, weeklyBreakdown, daysOfWeek } = monthlyData;
    const totalVolume = summary.totalVolume || 0;

    // Prepare line chart data for daily volume
    const dailyVolumeChartData = dailyBreakdown.map((day) => {
        const date = new Date(day.date);
        const label = date.toLocaleDateString("en", { month: "short", day: "numeric" });
        
        return {
            value: day.totalVolume || 0,
            label: label,
            labelTextStyle: { 
                color: colors.text.tertiary, 
                fontSize: 9,
                fontWeight: '500',
            },
            dataPointText: formatVolume(day.totalVolume),
            textShiftY: -8,
            textShiftX: -5,
            textFontSize: 8,
            textColor: isDarkMode ? colors.text.white : colors.text.primary,
            dataPointTextStyle: {
                color: isDarkMode ? colors.text.white : colors.text.primary,
                fontSize: 8,
                fontWeight: '600',
            },
        };
    });

    const maxVolume = Math.max(...dailyVolumeChartData.map(d => d.value), 1);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            <ScrollView 
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Summary Statistics Cards */}
                <View style={{ 
                    flexDirection: "row", 
                    flexWrap: "wrap", 
                    gap: 12,
                    marginBottom: 24 
                }}>
                    <View style={{ 
                        flex: 1,
                        minWidth: "47%",
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Activity size={18} color={colors.primary[600]} />
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}>
                                Total Volume
                            </Text>
                        </View>
                        <Text style={{ 
                            fontSize: 24, 
                            fontWeight: "800", 
                            color: colors.text.primary,
                            letterSpacing: -0.5,
                        }}>
                            {formatVolume(summary.totalVolume)}
                        </Text>
                        <Text style={{ 
                            fontSize: 14, 
                            color: colors.text.secondary,
                            marginTop: 2,
                        }}>
                            kg this month
                        </Text>
                    </View>

                    <View style={{ 
                        flex: 1,
                        minWidth: "47%",
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Repeat size={18} color={colors.primary[600]} />
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}>
                                Total Sets
                            </Text>
                        </View>
                        <Text style={{ 
                            fontSize: 24, 
                            fontWeight: "800", 
                            color: colors.text.primary,
                            letterSpacing: -0.5,
                        }}>
                            {summary.totalSets.toLocaleString()}
                        </Text>
                        <Text style={{ 
                            fontSize: 14, 
                            color: colors.text.secondary,
                            marginTop: 2,
                        }}>
                            sets logged
                        </Text>
                    </View>

                    <View style={{ 
                        flex: 1,
                        minWidth: "47%",
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Dumbbell size={18} color={colors.primary[600]} />
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}>
                                Unique Exercises
                            </Text>
                        </View>
                        <Text style={{ 
                            fontSize: 24, 
                            fontWeight: "800", 
                            color: colors.text.primary,
                            letterSpacing: -0.5,
                        }}>
                            {summary.uniqueExercises}
                        </Text>
                        <Text style={{ 
                            fontSize: 14, 
                            color: colors.text.secondary,
                            marginTop: 2,
                        }}>
                            exercises tracked
                        </Text>
                    </View>

                    <View style={{ 
                        flex: 1,
                        minWidth: "47%",
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Calendar size={18} color={colors.primary[600]} />
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}>
                                Workout Days
                            </Text>
                        </View>
                        <Text style={{ 
                            fontSize: 24, 
                            fontWeight: "800", 
                            color: colors.text.primary,
                            letterSpacing: -0.5,
                        }}>
                            {summary.workoutDays}
                        </Text>
                        <Text style={{ 
                            fontSize: 14, 
                            color: colors.text.secondary,
                            marginTop: 2,
                        }}>
                            {summary.avgVolumePerDay > 0 ? `${formatVolume(summary.avgVolumePerDay)} kg/day avg` : 'days active'}
                        </Text>
                    </View>
                </View>

                {/* Additional Metrics Cards */}
                {summary.totalVolume > 0 && (
                    <View style={{ 
                        flexDirection: "row", 
                        flexWrap: "wrap", 
                        gap: 12,
                        marginBottom: 24 
                    }}>
                        <View style={{ 
                            flex: 1,
                            minWidth: "47%",
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <Target size={18} color={colors.primary[600]} />
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.tertiary,
                                    fontWeight: "500",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}>
                                    Avg Weight/Rep
                                </Text>
                            </View>
                            <Text style={{ 
                                fontSize: 24, 
                                fontWeight: "800", 
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                            }}>
                                {summary.avgWeightPerSet > 0 ? summary.avgWeightPerSet.toFixed(1) : '0'}
                            </Text>
                            <Text style={{ 
                                fontSize: 14, 
                                color: colors.text.secondary,
                                marginTop: 2,
                            }}>
                                kg per rep
                            </Text>
                        </View>

                        <View style={{ 
                            flex: 1,
                            minWidth: "47%",
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <Repeat size={18} color={colors.primary[600]} />
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.tertiary,
                                    fontWeight: "500",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}>
                                    Avg Reps/Set
                                </Text>
                            </View>
                            <Text style={{ 
                                fontSize: 24, 
                                fontWeight: "800", 
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                            }}>
                                {summary.avgRepsPerSet > 0 ? summary.avgRepsPerSet.toFixed(1) : '0'}
                            </Text>
                            <Text style={{ 
                                fontSize: 14, 
                                color: colors.text.secondary,
                                marginTop: 2,
                            }}>
                                reps per set
                            </Text>
                        </View>
                    </View>
                )}

                {/* Volume Trend Indicator */}
                {summary.volumeTrend && summary.volumeTrend !== 'stable' && summary.totalVolume > 0 && (
                    <View style={{
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: summary.volumeTrend === 'increasing' 
                            ? colors.status.success + '30' 
                            : colors.status.error + '30',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <View style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: summary.volumeTrend === 'increasing' 
                                ? colors.status.success + '15' 
                                : colors.status.error + '15',
                            marginRight: 16,
                        }}>
                            {summary.volumeTrend === 'increasing' ? (
                                <TrendingUp size={24} color={colors.status.success} />
                            ) : (
                                <TrendingDown size={24} color={colors.status.error} />
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 4,
                            }}>
                                Volume Trend
                            </Text>
                            <Text style={{ 
                                fontSize: 18, 
                                fontWeight: "700", 
                                color: colors.text.primary,
                            }}>
                                {summary.volumeTrend === 'increasing' ? 'Increasing' : 'Decreasing'}
                            </Text>
                            <Text style={{ 
                                fontSize: 14, 
                                color: colors.text.secondary,
                                marginTop: 2,
                            }}>
                                {summary.volumeTrend === 'increasing' 
                                    ? 'Your volume increased throughout the month' 
                                    : 'Your volume decreased throughout the month'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Empty State Message */}
                {summary.totalVolume === 0 && summary.totalSets === 0 && summary.workoutDays === 0 && (
                    <View style={{
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 24,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Calendar size={48} color={colors.text.tertiary} />
                        <Text style={{ 
                            fontSize: 18, 
                            fontWeight: "600",
                            color: colors.text.primary,
                            marginTop: 16,
                            textAlign: 'center',
                        }}>
                            No Activity This Month
                        </Text>
                        <Text style={{ 
                            fontSize: 14, 
                            color: colors.text.secondary,
                            marginTop: 8,
                            textAlign: 'center',
                            lineHeight: 20,
                        }}>
                            You didn't log any workouts during this month. Start tracking your progress to see detailed statistics here.
                        </Text>
                    </View>
                )}

                {/* Best Day Card */}
                {summary.bestDay && (
                    <View style={{
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <View style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colors.primary[100],
                            marginRight: 16,
                        }}>
                            <Trophy size={24} color={colors.primary[600]} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 4,
                            }}>
                                Best Day
                            </Text>
                            <Text style={{ 
                                fontSize: 18, 
                                fontWeight: "700", 
                                color: colors.text.primary,
                            }}>
                                {formatDate(summary.bestDay.date)}
                            </Text>
                            <Text style={{ 
                                fontSize: 14, 
                                color: colors.text.secondary,
                                marginTop: 2,
                            }}>
                                {formatVolume(summary.bestDay.totalVolume)} kg • {summary.bestDay.totalSets} sets
                            </Text>
                        </View>
                    </View>
                )}

                {/* Daily Volume Chart */}
                {dailyVolumeChartData.length > 0 && (
                    <View style={{ 
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                    }}>
                        <Text style={{ 
                            fontSize: 16, 
                            fontWeight: "600", 
                            color: colors.text.primary,
                            marginBottom: 16 
                        }}>
                            Daily Volume Progression
                        </Text>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <LineChart
                                key={`linechart-${dailyVolumeChartData.length}-${maxVolume}`}
                                data={dailyVolumeChartData}
                                width={screenWidth - 120} // Account for container padding (16*2) + screen margins (48*2)
                                height={200}
                                spacing={48}
                                initialSpacing={20}
                                thickness={3}
                                color={colors.primary[600]}
                                curved
                                areaChart
                                startFillColor={colors.primary[600] + '40'}
                                endFillColor={colors.primary[600] + '10'}
                                startOpacity={0.4}
                                endOpacity={0.1}
                                yAxisThickness={1}
                                xAxisThickness={1}
                                xAxisColor={colors.border.medium}
                                yAxisColor={colors.border.medium}
                                yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                                xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: '500' }}
                                yAxisLabelWidth={40}
                                maxValue={maxVolume * 1.1 || 1000}
                                noOfSections={4}
                                isAnimated={false}
                                rulesColor={colors.border.light}
                                rulesType="solid"
                                dashGap={0}
                                hideDataPoints={false}
                                dataPointsColor={colors.primary[600]}
                                dataPointsRadius={4}
                                showTextOnDataPoints={true}
                                textBackgroundColor="transparent"
                            />
                        </View>
                    </View>
                )}

                {/* Weekly Breakdown */}
                {weeklyBreakdown && Array.isArray(weeklyBreakdown) && weeklyBreakdown.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ 
                            fontSize: 18, 
                            fontWeight: "bold", 
                            color: colors.text.primary,
                            marginBottom: 16 
                        }}>
                            Weekly Breakdown
                        </Text>
                        {weeklyBreakdown.map((week, index) => {
                            const weekStart = new Date(week.weekStart);
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            const weekLabel = `${weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en", { month: "short", day: "numeric" })}`;
                            
                            return (
                                <View
                                    key={week.weekStart}
                                    style={{
                                        backgroundColor: colors.background.card,
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 12,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}
                                >
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ 
                                                fontSize: 16, 
                                                fontWeight: "700", 
                                                color: colors.text.primary,
                                                marginBottom: 4,
                                            }}>
                                                Week {index + 1}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 12, 
                                                color: colors.text.tertiary,
                                            }}>
                                                {weekLabel}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={{ 
                                                fontSize: 18, 
                                                fontWeight: "800", 
                                                color: colors.primary[600],
                                                letterSpacing: -0.5,
                                            }}>
                                                {formatVolume(week.totalVolume)}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                marginTop: 2,
                                            }}>
                                                {week.totalSets} sets
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ 
                                        flexDirection: "row", 
                                        justifyContent: "space-between",
                                        paddingTop: 12,
                                        borderTopWidth: 1,
                                        borderTopColor: colors.border.light,
                                    }}>
                                        <View style={{ flex: 1, alignItems: "center" }}>
                                            <Text style={{ 
                                                fontSize: 16, 
                                                fontWeight: "700", 
                                                color: colors.text.primary,
                                            }}>
                                                {week.workoutDays}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                marginTop: 2,
                                            }}>
                                                Workout Days
                                            </Text>
                                        </View>
                                        <View style={{ width: 1, backgroundColor: colors.border.light }} />
                                        <View style={{ flex: 1, alignItems: "center" }}>
                                            <Text style={{ 
                                                fontSize: 16, 
                                                fontWeight: "700", 
                                                color: colors.text.primary,
                                            }}>
                                                {week.workoutDays > 0 ? formatVolume(week.totalVolume / week.workoutDays) : '0'}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                marginTop: 2,
                                            }}>
                                                Avg per Day
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Workout Consistency - Days of Week */}
                {daysOfWeek && Array.isArray(daysOfWeek) && daysOfWeek.length > 0 && summary.mostActiveDay && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ 
                            fontSize: 18, 
                            fontWeight: "bold", 
                            color: colors.text.primary,
                            marginBottom: 16 
                        }}>
                            Workout Consistency
                        </Text>
                        <View style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: colors.primary[100],
                                    marginRight: 12,
                                }}>
                                    <Calendar size={22} color={colors.primary[600]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ 
                                        fontSize: 14, 
                                        fontWeight: "600", 
                                        color: colors.text.secondary,
                                        marginBottom: 4,
                                    }}>
                                        Most Active Day
                                    </Text>
                                    <Text style={{ 
                                        fontSize: 18, 
                                        fontWeight: "700", 
                                        color: colors.text.primary,
                                    }}>
                                        {summary.mostActiveDay}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ 
                                paddingTop: 16,
                                borderTopWidth: 1,
                                borderTopColor: colors.border.light,
                            }}>
                                <Text style={{ 
                                    fontSize: 12, 
                                    fontWeight: "600", 
                                    color: colors.text.tertiary,
                                    marginBottom: 12,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}>
                                    Workouts by Day of Week
                                </Text>
                                {daysOfWeek.map((dayInfo) => {
                                    const maxCount = Math.max(...daysOfWeek.map(d => d.count), 1);
                                    const percentage = maxCount > 0 ? (dayInfo.count / maxCount) * 100 : 0;
                                    
                                    return (
                                        <View key={dayInfo.day} style={{ marginBottom: 10 }}>
                                            <View style={{ 
                                                flexDirection: "row", 
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: 6,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 13, 
                                                    fontWeight: "500", 
                                                    color: colors.text.secondary,
                                                    flex: 1,
                                                }}>
                                                    {dayInfo.dayName}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 13, 
                                                    fontWeight: "600", 
                                                    color: colors.text.primary,
                                                    marginLeft: 12,
                                                }}>
                                                    {dayInfo.count} {dayInfo.count === 1 ? 'workout' : 'workouts'}
                                                </Text>
                                            </View>
                                            <View style={{
                                                height: 6,
                                                backgroundColor: colors.background.primary,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                            }}>
                                                <View style={{
                                                    height: '100%',
                                                    width: `${percentage}%`,
                                                    backgroundColor: colors.primary[600],
                                                    borderRadius: 3,
                                                }} />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}

                {/* Exercise Breakdown */}
                {exerciseBreakdown.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ 
                            fontSize: 18, 
                            fontWeight: "bold", 
                            color: colors.text.primary,
                            marginBottom: 16 
                        }}>
                            Exercise Breakdown
                        </Text>
                        {exerciseBreakdown.map((exercise, index) => {
                            const percentage = totalVolume > 0 ? (exercise.totalVolume / totalVolume) * 100 : 0;
                            return (
                                <View
                                    key={exercise.exercise}
                                    style={{
                                        backgroundColor: colors.background.card,
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 12,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}
                                >
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ 
                                                fontSize: 16, 
                                                fontWeight: "700", 
                                                color: colors.text.primary,
                                                marginBottom: 4,
                                            }}>
                                                {exercise.exercise}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 12, 
                                                color: colors.text.tertiary,
                                            }}>
                                                {exercise.workoutDays} {exercise.workoutDays === 1 ? 'workout' : 'workouts'}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={{ 
                                                fontSize: 18, 
                                                fontWeight: "800", 
                                                color: colors.primary[600],
                                                letterSpacing: -0.5,
                                            }}>
                                                {formatVolume(exercise.totalVolume)}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                marginTop: 2,
                                            }}>
                                                {percentage.toFixed(1)}% of total
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ 
                                        flexDirection: "row", 
                                        justifyContent: "space-between",
                                        paddingTop: 12,
                                        borderTopWidth: 1,
                                        borderTopColor: colors.border.light,
                                    }}>
                                        <View style={{ flex: 1, alignItems: "center" }}>
                                            <Text style={{ 
                                                fontSize: 16, 
                                                fontWeight: "700", 
                                                color: colors.text.primary,
                                            }}>
                                                {exercise.totalSets}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                marginTop: 2,
                                            }}>
                                                Sets
                                            </Text>
                                        </View>
                                        <View style={{ width: 1, backgroundColor: colors.border.light }} />
                                        <View style={{ flex: 1, alignItems: "center" }}>
                                            <Text style={{ 
                                                fontSize: 16, 
                                                fontWeight: "700", 
                                                color: colors.text.primary,
                                            }}>
                                                {exercise.totalReps.toLocaleString()}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                marginTop: 2,
                                            }}>
                                                Reps
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Daily Breakdown */}
                {dailyBreakdown.length > 0 && (
                    <View>
                        <Text style={{ 
                            fontSize: 18, 
                            fontWeight: "bold", 
                            color: colors.text.primary,
                            marginBottom: 16 
                        }}>
                            Daily Breakdown
                        </Text>
                        {dailyBreakdown.map((day) => (
                            <View
                                key={day.date}
                                style={{
                                    backgroundColor: colors.background.card,
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border.light,
                                }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            fontWeight: "700", 
                                            color: colors.text.primary,
                                            marginBottom: 4,
                                        }}>
                                            {formatDate(day.date)}
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 12, 
                                            color: colors.text.tertiary,
                                        }}>
                                            {day.exerciseCount} {day.exerciseCount === 1 ? 'exercise' : 'exercises'}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: "flex-end" }}>
                                        <Text style={{ 
                                            fontSize: 18, 
                                            fontWeight: "800", 
                                            color: colors.primary[600],
                                            letterSpacing: -0.5,
                                        }}>
                                            {formatVolume(day.totalVolume)}
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 11, 
                                            color: colors.text.tertiary,
                                            marginTop: 2,
                                        }}>
                                            {day.totalSets} sets
                                        </Text>
                                    </View>
                                </View>

                                {day.exercises.length > 0 && (
                                    <View style={{ 
                                        flexDirection: "row", 
                                        flexWrap: "wrap",
                                        gap: 6,
                                        paddingTop: 12,
                                        borderTopWidth: 1,
                                        borderTopColor: colors.border.light,
                                    }}>
                                        {day.exercises.slice(0, 5).map((exerciseName) => (
                                            <View
                                                key={exerciseName}
                                                style={{
                                                    backgroundColor: colors.background.primary,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: colors.border.light,
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 11,
                                                    fontWeight: '500',
                                                    color: colors.text.secondary,
                                                }}>
                                                    {exerciseName}
                                                </Text>
                                            </View>
                                        ))}
                                        {day.exercises.length > 5 && (
                                            <View
                                                style={{
                                                    backgroundColor: colors.background.primary,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: colors.border.light,
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 11,
                                                    fontWeight: '500',
                                                    color: colors.text.tertiary,
                                                }}>
                                                    +{day.exercises.length - 5} more
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

