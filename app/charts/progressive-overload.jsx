import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { BarChart2 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import { getProgressiveOverloadComparison } from "../../lib/database";
import ProgressiveOverloadInsights from "../../components/Charts/ProgressiveOverloadInsights";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";

const TIMEFRAME_LABELS = {
    7: "7 days",
    30: "1 month",
    90: "3 months",
    180: "6 months",
    365: "1 year",
};

function getTimeframeLabel(tf) {
    if (tf === "all" || tf === 36500) return "all time";
    return TIMEFRAME_LABELS[tf] || `${tf} days`;
}

export default function ProgressiveOverloadScreen() {
    const colors = useThemedColors();
    const [comparisonData, setComparisonData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loadCompleted, setLoadCompleted] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState(30);
    
    const user = useAppStore(state => state.user);
    const progressiveOverloadInsightsData = useAppStore(state => state.chartsData.progressiveOverloadInsights);
    const loadProgressiveOverloadInsights = useAppStore(state => state.loadProgressiveOverloadInsights);
    
    const progressiveOverloadInsights = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return progressiveOverloadInsightsData[timeframeValue] || [];
    }, [progressiveOverloadInsightsData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            setLoadCompleted(false);
            loadProgressiveOverloadInsights(selectedTimeframe).then(() => {
                const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
                if (timeframeValue !== 36500 && typeof timeframeValue === 'number' && timeframeValue <= 365) {
                    getProgressiveOverloadComparison(user.id, timeframeValue).then(comparison => {
                        setComparisonData(comparison);
                    }).catch(error => {
                        console.error("Error loading comparison data:", error);
                    });
                } else {
                    setComparisonData(null);
                }
            }).finally(() => setLoadCompleted(true));
        }
    }, [user, selectedTimeframe]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        setLoadCompleted(false);
        loadProgressiveOverloadInsights(newTimeframe, false).then(() => {
            const timeframeValue = newTimeframe === 'all' ? 36500 : newTimeframe;
            if (timeframeValue !== 36500 && typeof timeframeValue === 'number' && timeframeValue <= 365) {
                return getProgressiveOverloadComparison(user.id, timeframeValue);
            }
            return null;
        }).then(comparison => {
            setComparisonData(comparison);
        }).catch(error => {
            console.error("Error loading comparison data:", error);
        }).finally(() => setLoadCompleted(true));
    };

    const handleCustomDateRange = (startDate, endDate) => {
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setSelectedTimeframe(daysDiff);
        setLoadCompleted(false);
        loadProgressiveOverloadInsights(daysDiff, true).then(() => {
            if (daysDiff <= 365) {
                return getProgressiveOverloadComparison(user.id, daysDiff);
            }
            return null;
        }).then(comparison => {
            setComparisonData(comparison);
        }).catch(error => {
            console.error("Error loading comparison data:", error);
        }).finally(() => setLoadCompleted(true));
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadProgressiveOverloadInsights(selectedTimeframe, true).then(() => {
            const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
            if (timeframeValue !== 36500 && typeof timeframeValue === 'number' && timeframeValue <= 365) {
                return getProgressiveOverloadComparison(user.id, timeframeValue);
            }
            return null;
        }).then(comparison => {
            setComparisonData(comparison);
        }).finally(() => {
            setRefreshing(false);
        });
    };

    const hasData = progressiveOverloadInsights && progressiveOverloadInsights.length > 0;

    if (!loadCompleted && !hasData && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading progressive overload insights...</Text>
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
                <TimeframeFilter 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onCustomDateRange={handleCustomDateRange}
                />

                {hasData ? (
                    <ProgressiveOverloadInsights 
                        progressiveOverloadInsights={progressiveOverloadInsights}
                        parentTimeframe={selectedTimeframe}
                        comparisonData={comparisonData}
                    />
                ) : (
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 60,
                        paddingHorizontal: 24,
                    }}>
                        <View style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            backgroundColor: colors.primary[100] || colors.background.input,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                        }}>
                            <BarChart2 size={28} color={colors.primary[600]} />
                        </View>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: colors.text.primary,
                            textAlign: 'center',
                            marginBottom: 8,
                        }}>
                            No data in this range
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            color: colors.text.secondary,
                            textAlign: 'center',
                            lineHeight: 22,
                        }}>
                            There are no progressive overload insights for the past {getTimeframeLabel(selectedTimeframe)}. Try selecting a longer date range or log more workouts to analyze your progression.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

