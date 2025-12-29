import React, { useEffect, useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions } from "react-native";
import { Calendar, CheckCircle2, XCircle, TrendingUp, Activity, ChevronRight, GitCompare } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../stores/useAppStore";
import { getWeeklyStats } from "../../lib/database";
import { LineChart } from "react-native-gifted-charts";
import { formatShortNumber } from "../../utils/numberUtils";
import WeeklyDayDetailModal from "../../components/Charts/WeeklyDayDetailModal";
import WeeklyCrossCheckModal from "../../components/Charts/WeeklyCrossCheckModal";

export default function WeeklyProgressScreen() {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [showDayDetailModal, setShowDayDetailModal] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState(null);
    const [showCrossCheckModal, setShowCrossCheckModal] = useState(false);
    const [weeklyStats, setWeeklyStats] = useState([]);
    
    // Use selective subscriptions from store - subscribe to entire nested object
    const user = useAppStore(state => state.user);
    const weeklyProgressData = useAppStore(state => state.chartsData.weeklyProgress);
    const loadWeeklyProgress = useAppStore(state => state.loadWeeklyProgress);
    
    // Extract timeframe-specific data (30 days) using useMemo to avoid infinite loops
    const weeklyProgress = useMemo(() => {
      const timeframeValue = 30; // Weekly progress uses 30 days
      return weeklyProgressData[timeframeValue] || [];
    }, [weeklyProgressData]);

    useEffect(() => {
        if (user) {
            // Default to 30 days timeframe for weekly progress
            loadWeeklyProgress(30);
            
            // Load weekly stats for cross-check (use 84 days to get ~12 weeks)
            getWeeklyStats(user.id, 84).then(stats => {
                setWeeklyStats(stats);
            }).catch(error => {
                console.error("Error loading weekly stats:", error);
            });
        }
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        loadWeeklyProgress(30, true).then(() => {
            if (user) {
                return getWeeklyStats(user.id, 84);
            }
        }).then(stats => {
            if (stats) setWeeklyStats(stats);
        }).finally(() => {
            setRefreshing(false);
        });
    };

    // Calculate week dates and enhance data
    const weekData = useMemo(() => {
        if (!weeklyProgress || weeklyProgress.length === 0) return [];
        
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return weeklyProgress.map((day, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index);
            
            return {
                ...day,
                date: dayDate,
                formattedDate: dayDate.toLocaleDateString("en", { 
                    month: "short", 
                    day: "numeric"
                }),
                fullDate: dayDate.toLocaleDateString("en", { 
                    month: "short", 
                    day: "numeric",
                    year: "numeric"
                }),
            };
        });
    }, [weeklyProgress]);

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        if (!weeklyProgress || weeklyProgress.length === 0) {
            return {
                totalVolume: 0,
                completedDays: 0,
                missedDays: 0,
                averageVolume: 0,
                bestDay: null,
                consistency: 0,
            };
        }

        const completedDays = weeklyProgress.filter(d => d.completed).length;
        const totalVolume = weeklyProgress.reduce((sum, d) => sum + (d.weight || 0), 0);
        const workoutDays = weeklyProgress.filter(d => d.completed && d.weight > 0);
        const averageVolume = workoutDays.length > 0 ? totalVolume / workoutDays.length : 0;
        
        const bestDay = weeklyProgress.reduce((best, current) => {
            if (current.weight > (best?.weight || 0)) {
                return current;
            }
            return best;
        }, null);

        const consistency = (completedDays / weeklyProgress.length) * 100;

        return {
            totalVolume,
            completedDays,
            missedDays: weeklyProgress.length - completedDays,
            averageVolume,
            bestDay,
            consistency,
        };
    }, [weeklyProgress]);

    // Handle day press
    const handleDayPress = (day) => {
        if (day.completed && day.date) {
            setSelectedDayDate(day.date);
            setShowDayDetailModal(true);
        }
    };

    // Calculate chart dimensions
    const chartWidth = useMemo(() => {
        const containerPadding = 16;
        const screenMargins = 48;
        return Dimensions.get("window").width - (screenMargins * 2) - (containerPadding * 2);
    }, []);

    // Prepare line chart data (only up to today, exclude future days)
    const lineChartData = useMemo(() => {
        if (!weekData || weekData.length === 0) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter to only include days up to today
        const daysUpToToday = weekData.filter(day => {
            if (!day.date) return false;
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate <= today;
        });
        
        return daysUpToToday.map((day, index) => ({
            value: day.weight || 0,
            label: day.day.substring(0, 3),
            labelTextStyle: { 
                color: colors.text.tertiary, 
                fontSize: 9,
                fontWeight: '500',
            },
            dataPointText: formatShortNumber(day.weight || 0),
            textShiftY: -8,
            textShiftX: -10,
            textColor: colors.text.primary,
            textFontSize: 13,
            dataPointColor: day.completed ? colors.primary[600] : colors.border.light,
        }));
    }, [weekData, colors]);

    // Calculate min/max for y-axis (extra top padding for data point labels)
    const lineChartMinMax = useMemo(() => {
        if (!lineChartData || lineChartData.length === 0) return { min: 0, max: 1000 };
        const values = lineChartData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const topPadding = (maxValue - minValue) * 0.15 || 150; // Extra padding for labels
        const bottomPadding = (maxValue - minValue) * 0.1 || 100;
        return { min: Math.max(0, minValue - bottomPadding), max: maxValue + topPadding };
    }, [lineChartData]);

    // Calculate spacing for line chart
    const initialSpacing = 20;
    const endSpacing = 20;
    const lineChartSpacing = 48;

    // Show loading only if no data exists and we're waiting for initial load
    const isLoading = !weeklyProgress || weeklyProgress.length === 0;
    
    if (isLoading && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading weekly progress...</Text>
            </View>
        );
    }

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
                {!weeklyProgress || weeklyProgress.length === 0 ? (
                    <View style={{ 
                        alignItems: "center", 
                        justifyContent: "center", 
                        paddingVertical: 60 
                    }}>
                        <Text style={{ 
                            fontSize: 16, 
                            color: colors.text.secondary 
                        }}>
                            No weekly progress data available
                        </Text>
                    </View>
                ) : (
                    <View>
                        {/* Summary Statistics */}
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
                                    {formatShortNumber(summaryStats.totalVolume)}
                                </Text>
                                <Text style={{ 
                                    fontSize: 14, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    kg this week
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
                                    <CheckCircle2 size={18} color={colors.primary[600]} />
                                    <Text style={{ 
                                        fontSize: 12, 
                                        color: colors.text.tertiary,
                                        fontWeight: "500",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}>
                                        Completed
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "800", 
                                    color: colors.text.primary,
                                    letterSpacing: -0.5,
                                }}>
                                    {summaryStats.completedDays}
                                </Text>
                                <Text style={{ 
                                    fontSize: 14, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    {summaryStats.completedDays === 1 ? 'day' : 'days'}
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
                                    <TrendingUp size={18} color={colors.primary[600]} />
                                    <Text style={{ 
                                        fontSize: 12, 
                                        color: colors.text.tertiary,
                                        fontWeight: "500",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}>
                                        Avg per Workout
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "800", 
                                    color: colors.text.primary,
                                    letterSpacing: -0.5,
                                }}>
                                    {formatShortNumber(summaryStats.averageVolume)}
                                </Text>
                                <Text style={{ 
                                    fontSize: 14, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    kg
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
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.tertiary,
                                    fontWeight: "500",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 8,
                                }}>
                                    Consistency
                                </Text>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "800", 
                                    color: colors.text.primary,
                                    letterSpacing: -0.5,
                                }}>
                                    {summaryStats.consistency.toFixed(0)}%
                                </Text>
                                <Text style={{ 
                                    fontSize: 14, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    workout rate
                                </Text>
                            </View>
                        </View>

                        {/* Volume Line Chart */}
                        {lineChartData.length > 0 && (
                            <View style={{ 
                                backgroundColor: colors.background.primary,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 24,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                                overflow: 'hidden'
                            }}>
                                <Text style={{ 
                                    fontSize: 16, 
                                    fontWeight: "600", 
                                    color: colors.text.primary,
                                    marginBottom: 16 
                                }}>
                                    Daily Volume
                                </Text>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <LineChart
                                        data={lineChartData}
                                        width={chartWidth}
                                        height={200}
                                        color={colors.primary[600]}
                                        thickness={3}
                                        dataPointsColor={colors.primary[600]}
                                        dataPointsRadius={5}
                                        hideDataPoints={false}
                                        hideRules={false}
                                        rulesType="solid"
                                        rulesColor={colors.border.light}
                                        yAxisColor={colors.border.light}
                                        xAxisColor={colors.border.light}
                                        yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                                        xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: '500' }}
                                        showVerticalLines={false}
                                        showHorizontalLines={true}
                                        spacing={lineChartSpacing}
                                        initialSpacing={initialSpacing}
                                        endSpacing={endSpacing}
                                        maxValue={lineChartMinMax.max}
                                        minValue={lineChartMinMax.min}
                                        noOfSections={5}
                                        yAxisSide="left"
                                        xAxisSide="bottom"
                                        curved={true}
                                        areaChart={true}
                                        startFillColor={colors.primary[600] + '40'}
                                        endFillColor={colors.primary[600] + '10'}
                                        startOpacity={0.4}
                                        endOpacity={0.1}
                                        yAxisThickness={1}
                                        xAxisThickness={1}
                                        yAxisLabelWidth={40}
                                        textColor={colors.text.primary}
                                        textFontSize={13}
                                        textShiftY={-8}
                                        textShiftX={-10}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Day-by-Day Breakdown */}
                        <View>
                            <View style={{ 
                                flexDirection: "row", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                marginBottom: 16 
                            }}>
                                <Text style={{ 
                                    fontSize: 18, 
                                    fontWeight: "bold", 
                                    color: colors.text.primary,
                                }}>
                                    Day-by-Day Breakdown
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowCrossCheckModal(true)}
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        backgroundColor: colors.background.primary,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}
                                >
                                    <GitCompare size={16} color={colors.primary[600]} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: '600',
                                        color: colors.primary[600],
                                    }}>
                                        Cross Check
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {weekData.map((day, index) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const dayDate = new Date(day.date);
                                dayDate.setHours(0, 0, 0, 0);
                                
                                const isToday = dayDate.toDateString() === today.toDateString();
                                const isFuture = dayDate > today;
                                
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleDayPress(day)}
                                        activeOpacity={day.completed ? 0.7 : 1}
                                        disabled={!day.completed}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            backgroundColor: colors.background.card,
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: isToday ? colors.primary[300] : colors.border.light,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            opacity: day.completed ? 1 : 0.7,
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                                            <View style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 12,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: day.completed 
                                                    ? colors.status.success + '20' 
                                                    : colors.background.primary,
                                                borderWidth: 1,
                                                borderColor: day.completed 
                                                    ? colors.status.success + '40' 
                                                    : colors.border.light,
                                            }}>
                                                {day.completed ? (
                                                    <CheckCircle2 size={24} color={colors.status.success} />
                                                ) : (
                                                    <XCircle size={24} color={colors.text.tertiary} />
                                                )}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                    <Text style={{ 
                                                        fontSize: 16, 
                                                        fontWeight: "700", 
                                                        color: colors.text.primary,
                                                    }}>
                                                        {day.day}
                                                    </Text>
                                                    {isToday && (
                                                        <View style={{
                                                            backgroundColor: colors.primary[100],
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 2,
                                                            borderRadius: 8,
                                                        }}>
                                                            <Text style={{
                                                                fontSize: 10,
                                                                fontWeight: "600",
                                                                color: colors.primary[700],
                                                                textTransform: "uppercase",
                                                            }}>
                                                                Today
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={{ 
                                                    fontSize: 13, 
                                                    color: colors.text.secondary 
                                                }}>
                                                    {day.fullDate}
                                                </Text>
                                                {day.completed && (
                                                    <Text style={{ 
                                                        fontSize: 11, 
                                                        color: colors.primary[600],
                                                        marginTop: 4,
                                                        fontWeight: "500",
                                                    }}>
                                                        Tap to view details
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                            {day.completed && day.weight > 0 ? (
                                                <>
                                                    <View style={{ alignItems: "flex-end" }}>
                                                        <Text style={{ 
                                                            fontSize: 20, 
                                                            fontWeight: "800", 
                                                            color: colors.text.primary,
                                                            letterSpacing: -0.5,
                                                        }}>
                                                            {formatShortNumber(day.weight)}
                                                        </Text>
                                                        <Text style={{ 
                                                            fontSize: 12, 
                                                            color: colors.text.secondary,
                                                            marginTop: 2,
                                                        }}>
                                                            kg
                                                        </Text>
                                                    </View>
                                                    <ChevronRight size={20} color={colors.primary[600]} />
                                                </>
                                            ) : (
                                                <View style={{ alignItems: "flex-end" }}>
                                                    <Text style={{ 
                                                        fontSize: 13, 
                                                        color: colors.text.tertiary,
                                                        fontStyle: isFuture ? "normal" : "italic",
                                                    }}>
                                                        {isFuture ? "Upcoming" : "No workout"}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Best Day Highlight */}
                        {summaryStats.bestDay && summaryStats.bestDay.weight > 0 && (
                            <View style={{
                                marginTop: 24,
                                backgroundColor: colors.primary[50],
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.primary[200],
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <TrendingUp size={18} color={colors.primary[600]} />
                                    <Text style={{ 
                                        fontSize: 14, 
                                        fontWeight: "600", 
                                        color: colors.text.primary,
                                    }}>
                                        Best Day
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 16, 
                                    color: colors.text.secondary 
                                }}>
                                    {summaryStats.bestDay.day} - {formatShortNumber(summaryStats.bestDay.weight)} kg
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
            
            <WeeklyDayDetailModal
                visible={showDayDetailModal}
                onClose={() => setShowDayDetailModal(false)}
                dayDate={selectedDayDate}
                userId={user?.id}
            />
            
            <WeeklyCrossCheckModal
                visible={showCrossCheckModal}
                onClose={() => setShowCrossCheckModal(false)}
                weeklyStats={weeklyStats}
            />
        </View>
    );
}

